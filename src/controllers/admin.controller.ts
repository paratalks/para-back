import { Request, Response, NextFunction, RequestHandler } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Admin } from "../models/admin/admin.modle";
import { User } from "../models/user/user.model";
import { ParaExpert } from "../models/paraExpert/paraExpert.model";
import { Status, Role } from "../util/index";
import { ApiError } from "../util/apiError";
import { asyncHandler } from "../util/asyncHandler";
import { ApiResponse } from "../util/apiResponse";
import { ResponseStatusCode } from "../constants/constants";
import { Appointments } from "../models/appointments/appointments.model";
import { Payment } from "../models/payment/payment.model";

import { Schema } from "mongoose";

export const isValidatedPassword = async function (
  usersendPassword: string,
  password: string
) {
  return await bcrypt.compare(usersendPassword, password);
};

export const adminSignup: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      name,
      email,
      password,
      profilePicture,
      phone,
      refreshToken,
      fcmToken,
    } = req.body;

    if (!name || !email || !password) {
      throw new ApiError(
        ResponseStatusCode.BAD_REQUEST,
        "All fields are required"
      );
    }

    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      return res
        .status(400)
        .json(
          new ApiResponse(ResponseStatusCode.BAD_REQUEST, {
            message: "Admin already exists",
          })
        );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newAdmin = new Admin({
      name,
      email,
      password: hashedPassword,
      profilePicture,
      phone,
      refreshToken,
      fcmToken,
      status: Status.ACTIVE,
      role: Role.ADMIN,
    });

    await newAdmin.save();

    res.json(
      new ApiResponse(
        ResponseStatusCode.SUCCESS,
        { admin: newAdmin },
        "Admin Registered Successfully!"
      )
    );
  } catch (error) {
    next(
      new ApiError(
        ResponseStatusCode.INTERNAL_SERVER_ERROR,
        error.message || "Failure in Admin registration"
      )
    );
  }
};

export const adminLogin: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(
        ResponseStatusCode.BAD_REQUEST,
        "Email and password are required"
      );
    }

    const admin = await Admin.findOne({ email }).select(
      "-createdAt -updatedAt -__v"
    );

    if (!admin) {
      throw new ApiError(
        ResponseStatusCode.UNAUTHORIZED,
        "Invalid email or password"
      );
    }

    const isValidPassword = await isValidatedPassword(
      password,
      admin.password.toString()
    );
    if (!isValidPassword) {
      throw new ApiError(
        ResponseStatusCode.UNAUTHORIZED,
        "Invalid email or password"
      );
    }

    const adminDetails = {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      profilePicture: admin.profilePicture,
      role: admin.role,
    };

    const payload = {
      userId: admin?._id,
      email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRY,
    });

    res.json(
      new ApiResponse(
        ResponseStatusCode.SUCCESS,
        { token, adminDetails },
        `${admin.name} Logged In Successfully!`
      )
    );
  } catch (error) {
    next(
      new ApiError(
        ResponseStatusCode.INTERNAL_SERVER_ERROR,
        error.message || "Failure in Admin login"
      )
    );
  }
};

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const totalParaExperts = await ParaExpert.countDocuments();
    const totalUsers = await User.countDocuments({ status: "active" });
    const startOfMonth = (date: Date): Date => {
      return new Date(date.getFullYear(), date.getMonth(), 1);
    };

    const endOfMonth = (date: Date): Date => {
      return new Date(date.getFullYear(), date.getMonth() + 1, 0);
    };
    const totalRevenue = await Payment.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    try {
      const currentMonthRevenue = await Payment.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startOfMonth,
              $lte: endOfMonth,
            },
          },
        },
        {
          $group: {
            _id: null,
            monthlyAmount: { $sum: "$amount" },
          },
        },
      ]);
      const dashboardData = {
        totalParaExperts,
        totalUsers,
        totalRevenue: totalRevenue[0]?.totalAmount || 0,
        monthlyRevenue: currentMonthRevenue[0]?.monthlyAmount || 0,
      };
      res.json({
        statusCode: 200,
        data: dashboardData,
        message: "Dashboard data fetched successfully",
        success: true,
      });
    } catch (error) {
      console.error("Error calculating current month revenue:", error);
      throw error;
    }
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      data: null,
      message: "Internal server error",
      success: false,
    });
  }
};

export const getUsers: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const page = parseInt(req.query.page as string, 10) || 1;

    const skip = (page - 1) * limit;

    const users = await User.find({})
      .select("name phone gender interests profilePicture status")
      .limit(limit)
      .skip(skip);

    const totalUsers = await User.countDocuments({});

    res.json(
      new ApiResponse(
        ResponseStatusCode.SUCCESS,
        { users, totalUsers, limit, page },
        "Users fetched successfully!"
      )
    );
  } catch (error) {
    next(
      new ApiError(
        ResponseStatusCode.INTERNAL_SERVER_ERROR,
        error.message || "Failure in fetching Admins"
      )
    );
  }
};

export const getParaExpert: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const page = parseInt(req.query.page as string, 10) || 1;

    const skip = (page - 1) * limit;

    const paraExpert = await ParaExpert.find({})
      .select("userId experience basedOn ratings expertise")
      .limit(limit)
      .skip(skip)
      .populate({
        path: "userId",
        model: "User",
        select: "name gender profilePicture status",
      });

    const totalExperts = await ParaExpert.countDocuments({});

    res.json(
      new ApiResponse(
        200,
        { paraExpert, totalExperts, limit, page },
        "paraExpert fetched successfully!"
      )
    );
  } catch (error) {
    next(
      new ApiError(
        ResponseStatusCode.INTERNAL_SERVER_ERROR,
        error.message || "Failure in fetching Admins"
      )
    );
  }
};

export const getParaExpertByID = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { paraExpertID } = req.params;
      const paraExpert = await ParaExpert.findById(paraExpertID)
        .select("-createdAt -updatedAt -__v")
        .populate({
          path: "userId",
          model: "User",
          select: "name phone gender email profilePicture",
        });
      return res.json(
        new ApiResponse(
          ResponseStatusCode.SUCCESS,
          paraExpert,
          "para expert fetched successfully"
        )
      );
    } catch (error) {
      return res.json(
        new ApiResponse(ResponseStatusCode.INTERNAL_SERVER_ERROR, error.message)
      );
    }
  }
);

export const updateParaExpertById = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { paraExpertID } = req.params;
    const updateData = req.body;

    const paraExpert = await ParaExpert.findByIdAndUpdate(paraExpertID, updateData, { new: true, runValidators: true })
      .select("-createdAt -updatedAt -__v")

    if (!paraExpert) {
      return res.json(
        new ApiResponse(ResponseStatusCode.NOT_FOUND, {}, "ParaExpert not found")
      );
    }

    return res.json(
      new ApiResponse(
        ResponseStatusCode.SUCCESS,
        null,
        "ParaExpert updated successfully"
      )
    );
  } catch (error) {
    return res.json(
      new ApiResponse(ResponseStatusCode.INTERNAL_SERVER_ERROR, error.message || "Internal server error")
    );
  }
});

export const paraExpertSignup: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      name,
      gender,
      email,
      phone,
      dateOfBirth,
      interests,
      fcmToken,
      expertise,
      availability,
      packages,
      profilePicture,
      ratings,
      bio,
      basedOn,
      qualifications,
      experience,
      consultancy,
      socials,
    } = req.body;

    const user: any = req.user;

    if (user && user.name && user.gender && user.dateOfBirth) {
      return res
        .status(400)
        .json(
          new ApiResponse(ResponseStatusCode.BAD_REQUEST, {
            message: "User already exist",
          })
        );
    }

    const toStore = {
      name,
      gender,
      email,
      phone,
      dateOfBirth,
      interests,
      profilePicture,
      fcmToken,
    };

    const newUser = new User(toStore);
    const savedUser = await newUser.save();

    const paraExpert = new ParaExpert({
      userId: savedUser?._id as Schema.Types.ObjectId,
      interests,
      expertise,
      availability,
      packages,
      ratings,
      bio,
      basedOn,
      qualifications,
      experience,
      consultancy,
      socials,
    });

    await paraExpert.save();
    res.json(
      new ApiResponse(
        ResponseStatusCode.SUCCESS,
        paraExpert,
        "Paraexpert user created successfully"
      )
    );
  } catch (error) {
    res.json(
      new ApiResponse(ResponseStatusCode.INTERNAL_SERVER_ERROR, error?.message)
    );
  }
};

export const getAppointments: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const page = parseInt(req.query.page as string, 10) || 1;

    const skip = (page - 1) * limit;

    const appointments = await Appointments.find({})
      .select("-createdAt -updatedAt -callToken -__v")
      .limit(limit)
      .skip(skip)
      .populate({
        path: "userId",
        model: "User",
        select: "name profilePicture",
      })
      .populate({
        path: "paraExpertId",
        model: "ParaExpert",
        select: "userId",
        populate: {
          path: "userId",
          model: "User",
          select: "name profilePicture",
        },
      });

    const totalBookings = await Appointments.countDocuments({});

    res.json(
      new ApiResponse(
        200,
        { appointments, totalBookings, limit, page },
        "All Appointments fetched successfully!"
      )
    );
  } catch (error) {
    next(
      new ApiError(
        ResponseStatusCode.INTERNAL_SERVER_ERROR,
        error.message || "Failure in fetching Admins"
      )
    );
  }
};

export const getAppointmentById = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { appointmentId } = req.params;
      const appointment = await Appointments.findById(appointmentId)
        .select("-createdAt -updatedAt -callToken -__v")
        .populate([
          {
            path: "userId",
            model: "User",
            select: "name profilePicture gender phone status",
          },
          {
            path: "paraExpertId",
            model: "ParaExpert",
            select: "userId",
            populate: {
              path: "userId",
              model: "User",
              select: "name profilePicture gender phone status",
            },
          },
        ]);

      return res.json(
        new ApiResponse(
          ResponseStatusCode.SUCCESS,
          { appointment },
          "Appointment fetched successfully"
        )
      );
    } catch (error) {
      throw new ApiError(
        ResponseStatusCode.INTERNAL_SERVER_ERROR,
        error.message || "Internal server error"
      );
    }
  }
);

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId)
    .select("-createdAt -updatedAt -fcmToken -__v")
    if (!user) {
      return res.json(
        new ApiResponse(ResponseStatusCode.NOT_FOUND, {}, "user not found")
      );
    }
    return res.json(
      new ApiResponse(
        ResponseStatusCode.SUCCESS,
        user,
        "user found successfully"
      )
    );
  } catch (error) {
    throw new ApiError(
      ResponseStatusCode.INTERNAL_SERVER_ERROR,
      error.message || "Internal server error"
    );
  }
});

export const updateUserById = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true })
      .select("-createdAt -updatedAt -fcmToken -__v");

    if (!user) {
      return res.json(
        new ApiResponse(ResponseStatusCode.NOT_FOUND, {}, "User not found")
      );
    }

    return res.json(
      new ApiResponse(
        ResponseStatusCode.SUCCESS,
        user,
        "User updated successfully"
      )
    );
  } catch (error) {
    throw new ApiError(
      ResponseStatusCode.INTERNAL_SERVER_ERROR,
      error.message || "Internal server error"
    );
  }
});
