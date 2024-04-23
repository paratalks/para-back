import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Request, Response } from "express";
import { apiError } from "../util/apiError";
import { asyncHandler } from "../util/asyncHandler";
import { User } from "../models/user/user.model";
import { paraExpert } from "../models/paraExpert/paraExpert.model";
import { apiResponse } from "../util/apiResponse";
import {
  userSchemaDocument,
  userSchemaModel,
  userTypes,
} from "../models/user/user.types";
// import { paraExpertSchemaDocument } from "../models/paraExpert/paraExpert.types";

// interface UpdateUserDetailsRequest extends Request {
//   body: userSchemaDocument, paraExpertSchemaDocument;
// }

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
      throw new apiError(400, "All fields are required");
    }

    const user = await User.findByIdAndUpdate(
      req.user?._id,
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
      .status(200)
      .json(new apiResponse(200, user, "User details updated successfully"));
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
      throw new apiError(400, "All fields are required");
    }

    const user = await paraExpert.findByIdAndUpdate(
      req.user?._id,
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

    const expert = await paraExpert.findById({ userId: req.user?._id })

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
      .status(200)
      .json(new apiResponse(200, user, "Para Expert details updated successfully"));
  }
);

export { updateUserDetails, updateParaExpertDetails };
