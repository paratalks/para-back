import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { ApiError } from "../util/apiError";
import { asyncHandler } from "../util/asyncHandler";
import { User } from "../models/user/user.model";
import { ParaExpert } from "../models/paraExpert/paraExpert.model";
import { ApiResponse } from "../util/apiResponse";

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
      throw new ApiError(400, "All fields are required");
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
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

    return res
      .json(new ApiResponse(200, user, "User details updated successfully"));
  }
);

const updateParaExpertDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, gender, dateOfBirth, interests, phone, expertise, availability, pricing, profilePicture } = req.body as {
      name: String;
      gender: String;
      dateOfBirth: Date;
      interests: [String];
      phone: String;
      expertise: String[];
      availability: [{ day: string; slots: string[] }];
      pricing: number;
      profilePicture: String;
    };

    if (!name || !gender || !dateOfBirth || !interests || !phone || !expertise || !availability || !pricing || !profilePicture) {
      throw new ApiError(400, "All fields are required");
    }

    const paraExpertId = req.params;

    const user = await ParaExpert.findByIdAndUpdate(
      req.params.paraExpertId,
      {
        $set: {
          expertise,
          availability,
          pricing,
          profilePicture,
        },
      },
      { new: true }
    );

    const expert = await ParaExpert.findById( req.params.paraExpertId );

    const updateUser = await User.findByIdAndUpdate(
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

    return res
      .json(new ApiResponse(200, user, "Para Expert details updated successfully"));
  }
);

export { updateUserDetails, updateParaExpertDetails };
