import { Request, Response } from "express";
import { ApiError } from "../util/apiError";
import { asyncHandler } from "../util/asyncHandler";
import { User } from "../models/user/user.model";
import { ParaExpert } from "../models/paraExpert/paraExpert.model";
import { ApiResponse } from "../util/apiResponse";
import { ResponseStatusCode } from "../constants/constants";
import { paraUpdateObject } from "../constants/types";
import { Notifications } from "../models/notification/notification.model";

import { uploadfileToS3 } from "../util/s3Client.util";

export const updateUserDetails = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { name, email, gender, interests, profilePicture, phone, dateOfBirth } =
    req.body;

  const updateFields: any = {};

  if (name) updateFields.name = name;
  if (email) updateFields.email = email;
  if (gender) updateFields.gender = gender;
  if (dateOfBirth) updateFields.dateOfBirth = new Date(dateOfBirth);
  if (interests) updateFields.interests = interests;
  if (profilePicture) updateFields.profilePicture = profilePicture;
  if (phone) updateFields.phone = phone;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true }
    ).select("-password -refreshToken");

    if (!user) {
      throw new ApiError(ResponseStatusCode.NOT_FOUND, "User not found");
    }

    res.json(
      new ApiResponse(
        ResponseStatusCode.SUCCESS,
        user,
        "User details updated successfully"
      )
    );
  } catch (error) {
    new ApiResponse(ResponseStatusCode.INTERNAL_SERVER_ERROR, error.message)
  }
});
export const updateParaExpertDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      name,
      gender,
      interests,
      phone,
      email,
      expertise,
      profilePicture,
      ratings,
      bio,
      basedOn,
      qualifications,
      experience,
      consultancy,
      socials,
    }: paraUpdateObject = req.body;

    const dateOfBirth = new Date(req.body.dateOfBirth);

    if (
      !name ||
      !gender ||
      !dateOfBirth ||
      !interests ||
      !phone ||
      !expertise ||
      !profilePicture ||
      !email
    ) {
      throw new ApiError(
        ResponseStatusCode.BAD_REQUEST,
        "All fields are required"
      );
    }

    const paraExpert = req.user;
    const paraExpertId = paraExpert._id;

    await User.findByIdAndUpdate(
      paraExpertId,
      {
        $set: {
          name,
          gender,
          email,
          dateOfBirth,
          interests,
          profilePicture,
          phone,
        },
      },
      { new: true }
    );

    const expert = await ParaExpert.findOneAndUpdate(
      { userId: paraExpertId },
      {
        $set: {
          expertise,
          ratings,
          bio,
          basedOn,
          qualifications,
          experience,
          consultancy,
          socials,
        },
      },
      { new: true }
    )
      .select("-createdAt -updatedAt -__v -availability -packages")
      .populate({
        path: "userId",
        model: "User",
        select: "name phone gender email profilePicture",
      });

    return res.json(
      new ApiResponse(
        ResponseStatusCode.SUCCESS,
        { expert },
        "Para Expert details updated successfully"
      )
    );
  }
);

export const getParaExpertDetails = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const paraUser = req.user;
      const paraExpertId = paraUser?._id;
      const paraExpert = await ParaExpert.findOne({ userId: paraExpertId })
        .select("-createdAt -updatedAt -__v -availability -packages")
        .populate({
          path: "userId",
          model: "User",
          select:
            "name phone gender interests dateOfBirth email profilePicture ",
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

export const setAvailability = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { availability } = req.body as {
      availability: Array<{
        day: number;
        slots: { chat: string[]; video_call: string[]; audio_call: string[] };
      }>;
    };

    const user = req.user;
    const userId = user._id;
    const para = await ParaExpert.findOne({ userId });

    if (!availability) {
      throw new ApiError(
        ResponseStatusCode.BAD_REQUEST,
        "All fields are required"
      );
    }

    if (
      availability.filter((item) => item.day < 0 || item.day > 6).length > 0
    ) {
      return res.json(
        new ApiResponse(ResponseStatusCode.BAD_REQUEST, "Invalid day")
      );
    }

    const paraExpert = await ParaExpert.findByIdAndUpdate(
      para._id,
      { $set: { availability } },
      { new: true }
    );

    return res.json(
      new ApiResponse(
        ResponseStatusCode.SUCCESS,
        paraExpert.availability,
        "ParaExpert availability updated successfully"
      )
    );
  } catch (error) {
    throw new ApiError(
      ResponseStatusCode.INTERNAL_SERVER_ERROR,
      error.message || "Internal server error"
    );
  }
});

export const getAvailability = asyncHandler(async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const userId = user._id;
    const paraExpert = await ParaExpert.findOne({ userId });
    if (!paraExpert) {
      throw new ApiError(
        ResponseStatusCode.NOT_FOUND,
        "Para Expert Not Founded"
      );
    }
    return res.json(
      new ApiResponse(
        ResponseStatusCode.SUCCESS,
        { availability: paraExpert.availability },
        "ParaExpert availability fetched successfully"
      )
    );
  } catch (error) {
    throw new ApiError(
      ResponseStatusCode.INTERNAL_SERVER_ERROR,
      error.message || "Internal server error"
    );
  }
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  try {

    const { userId } = req.params;
    const user = await User.findById(userId);
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

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  try {
    const user: any = req.user;
    const userId = user._id;
    const notifications = await Notifications.find({ userId: userId });
    if (!notifications) {
      return res.json(
        new ApiResponse(
          ResponseStatusCode.NOT_FOUND,
          {},
          "notification not found"
        )
      );
    }
    return res.json(
      new ApiResponse(
        ResponseStatusCode.SUCCESS,
        notifications,
        "notifications found successfully"
      )
    );
  } catch (error) {
    throw new ApiError(
      ResponseStatusCode.INTERNAL_SERVER_ERROR,
      error.message || "Internal server error"
    );
  }
});

export const dev = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { packages } = req.body;
    const para = await ParaExpert.updateMany(
      {},
      {
        $set: {
          packages,
        },
      },
      { new: true }
    );
    return res.json(
      new ApiResponse(ResponseStatusCode.SUCCESS, para, "updated successfully")
    );
  } catch (error) {
    throw new ApiError(
      ResponseStatusCode.INTERNAL_SERVER_ERROR,
      error.message || "Internal server error"
    );
  }
});

export const uploadProfile = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            ResponseStatusCode.BAD_REQUEST,
            null,
            "No file uploaded"
          )
        );
    }

    const localFilePath = req.file.path;
    const accessUrl = await uploadfileToS3(localFilePath, "user-profile");

    return res.json(
      new ApiResponse(
        ResponseStatusCode.SUCCESS,
        accessUrl,
        "Profile Pic Uploaded successfully"
      )
    );
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new ApiError(
      ResponseStatusCode.INTERNAL_SERVER_ERROR,
      error.message || "Internal server error"
    );
  }
};

export const uploadQualificationDetails = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            ResponseStatusCode.BAD_REQUEST,
            null,
            "No file uploaded"
          )
        );
    }
    if (!req.file) {
      return res.status(400).send('No file uploaded');
    }

    const localFilePath = req.file.path;

    const fileUrl = await uploadfileToS3(localFilePath, "certificate");

    return res.json(
      new ApiResponse(
        ResponseStatusCode.SUCCESS,
        fileUrl,
        "Qualification Details  Uploaded successfully"
      )
    );
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new ApiError(
      ResponseStatusCode.INTERNAL_SERVER_ERROR,
      error.message || "Internal server error"
    );
  }
};