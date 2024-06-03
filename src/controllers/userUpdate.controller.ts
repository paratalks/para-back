import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { ApiError } from "../util/apiError";
import { asyncHandler } from "../util/asyncHandler";
import { User } from "../models/user/user.model";
import { ParaExpert } from "../models/paraExpert/paraExpert.model";
import { ApiResponse } from "../util/apiResponse";
import { ResponseStatusCode } from "../constants/constants";

const updateUserDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, gender, dateOfBirth, interests, phone } = req.body as {
      name: String;
      gender: String;
      dateOfBirth: Date;
      interests: [String];
      phone: String;
    };

    if (!name || !gender || !dateOfBirth || !interests || !phone) {
      throw new ApiError(ResponseStatusCode.BAD_REQUEST, "All fields are required");
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          name,
          gender,
          dateOfBirth,
          interests,
          phone,
        },
      },
      { new: true }
    );

    return res.json(
      new ApiResponse(
        ResponseStatusCode.SUCCESS,
        user,
        "User details updated successfully"
      )
    );
  }
);

const updateParaExpertDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      name,
      gender,
      dateOfBirth,
      interests,
      phone,
      expertise,
      availability,
      packageOption,
      profilePicture,
    } = req.body as {
      name: String;
      gender: String;
      dateOfBirth: Date;
      interests: [String];
      phone: String;
      expertise: String[];
      availability: [{ day: string; slots: string[] }];
      packageOption: {
        title: string;
        type: string;
        amount: number;
      }[];
      profilePicture: String;
    };

    if (!name || !gender || !dateOfBirth || !interests || !phone || !expertise || !availability || !packageOption || !profilePicture) {
      throw new ApiError(
        ResponseStatusCode.BAD_REQUEST,
        "All fields are required"
      );
    }

    const paraExpertId = req.user._id;

    const user = await ParaExpert.findByIdAndUpdate(
      paraExpertId,
      {
        $set: {
          expertise,
          availability,
          packageOption,
          profilePicture,
        },
      },
      { new: true }
    );

    const expert = await ParaExpert.findById( paraExpertId );

    await User.findByIdAndUpdate(
        expert.userId,
        {
            $set: {
                name,
                gender,
                dateOfBirth,
                interests,
                phone,
            },
        },
        {new:true}
    )

    return res.json(
      new ApiResponse(
        ResponseStatusCode.SUCCESS,
        user,
        "Para Expert details updated successfully"
      )
    );
  }
);

//paraexpert
const setAvailability = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { availability } = req.body as {
      availability: [{ day: number; slots: [string] }];
    };

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
      req.user._id,
      {
        $set: {
          availability,
        },
      },
      { new: true }
    );

    return res.json(
      new ApiResponse(
        ResponseStatusCode.SUCCESS,
        paraExpert,
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


export { updateUserDetails, updateParaExpertDetails, setAvailability };
