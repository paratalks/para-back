import { Request, Response, NextFunction, RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Admin } from '../models/admin/admin.modle'; 
import { User } from "../models/user/user.model";
import { ParaExpert } from "../models/paraExpert/paraExpert.model";
import { Status, Role } from '../util/index';
import { ApiError } from "../util/apiError";
import { asyncHandler } from "../util/asyncHandler";
import { ApiResponse } from "../util/apiResponse";
import { ResponseStatusCode } from "../constants/constants";
import { notification } from '../util/notification.util';
import { Schema } from 'mongoose';

export const isValidatedPassword = async function (
    usersendPassword: string,
    password: string
  ) {
    return await bcrypt.compare(usersendPassword, password);
};

export const adminSignup: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
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

    if (!name || !email || !password ) {
      throw new ApiError(ResponseStatusCode.BAD_REQUEST, "All fields are required");
    }

    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      return res.status(400).json(new ApiResponse(400, { message: "Admin already exists" }));
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

  

    // const token = jwt.sign({ id: newAdmin._id, role: newAdmin.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json(new ApiResponse(200, {admin: newAdmin }, "Admin Registered Successfully!"));
  } catch (error) {
    next(new ApiError(ResponseStatusCode.INTERNAL_SERVER_ERROR, error.message || "Failure in Admin registration"));
  }
};

export const adminLogin: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
  
      if (!email || !password) {
        throw new ApiError(ResponseStatusCode.BAD_REQUEST, "Email and password are required");
      }
  
      const admin = await Admin.findOne({ email }).select('-createdAt -updatedAt -__v');
  
      if (!admin) {
        throw new ApiError(ResponseStatusCode.UNAUTHORIZED, "Invalid email or password");
      }
  
    //   const isPasswordValid = await bcrypt?.compare(password, admin.password);
    const isValidPassword = await isValidatedPassword(
        password,
        admin.password.toString()
      );
      if (!isValidPassword) {
        throw new ApiError(ResponseStatusCode.UNAUTHORIZED, "Invalid email or password");
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
    
      res.json(new ApiResponse(200, { token, adminDetails }, `${admin.name} Logged In Successfully!`));
    } catch (error) {
      next(new ApiError(ResponseStatusCode.INTERNAL_SERVER_ERROR, error.message || "Failure in Admin login"));
    }
};

export const getUsers: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find({}).select('name phone gender interests profilePicture status');
    res.json(new ApiResponse(200, { users }, "Users fetched successfully!"));
  } catch (error) {
    next(new ApiError(ResponseStatusCode.INTERNAL_SERVER_ERROR, error.message || "Failure in fetching Admins"));
  }
};

export const getParaExpert: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const paraExpert = await ParaExpert.find({})
    .select('userId experience basedOn ratings expertise')
    .populate({
      path: 'userId',
      model:'User',
      select: 'name gender profilePicture status',
    });  res.json(new ApiResponse(200, { paraExpert }, "paraExpert fetched successfully!"));
  } catch (error) {
    next(new ApiError(ResponseStatusCode.INTERNAL_SERVER_ERROR, error.message || "Failure in fetching Admins"));
  }
};

export const getParaExpertByID = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { paraExpertID } = req.params;
      const paraExpert = await ParaExpert.findById(paraExpertID).select('-createdAt -updatedAt -__v')
      .populate({
        path: 'userId',
        model:'User',
        select: 'name phone gender email profilePicture',
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

export const paraExpertSignup: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
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
        socials
      } = req.body;

      const user: any = req.user;

      if (user && user.name && user.gender && user.dateOfBirth) {
        return res
          .status(400)
          .json(new ApiResponse(400, { message: "User already exist" }));
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
          socials
        });

        await paraExpert.save();
        res
          .json(
            new ApiResponse(
              ResponseStatusCode.SUCCESS,
              paraExpert,
              "Paraexpert user created successfully"
            )
          );
      
    } catch (error) {
      res.json(
        new ApiResponse(
          ResponseStatusCode.INTERNAL_SERVER_ERROR,
          error?.message
        )
      );
    }
  };