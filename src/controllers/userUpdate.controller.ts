import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { ApiError } from "../util/apiError";
import { asyncHandler } from "../util/asyncHandler";
import { User } from "../models/user/user.model";
import { ParaExpert } from "../models/paraExpert/paraExpert.model";
import { ApiResponse } from "../util/apiResponse";
import { ResponseStatusCode } from "../constants/constants";
import { paraUpdateObject } from "../constants/types";
import { ObjectId } from "mongoose";
import { Notifications } from "../models/notification/notification.model";

const updateUserDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, gender, interests, profilePicture, phone } = req.body as {
      name: String;
      gender: String;
      interests: [String];
      profilePicture: String;
      phone: String;
    };
    const dateOfBirth = new Date(req.body.dateOfBirth)

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
          profilePicture,
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
      interests,
      phone,
      expertise,
      availability,
      packages,
      profilePicture,
      ratings,
      bio,
      basedOn,
      qualifications,
      reviews,
    }:paraUpdateObject = req.body 

    const dateOfBirth=new Date(req.body.dateOfBirth)
    
    if (!name || !gender || !dateOfBirth || !interests || !phone || !expertise || !availability || !packages || !profilePicture) {
      throw new ApiError(
        ResponseStatusCode.BAD_REQUEST,
        "All fields are required"
      );
    }

    const paraExpert = req.user;
    const paraExpertId=paraExpert._id

    const user = await ParaExpert.findOneAndUpdate(
      { userId: paraExpertId },
      {
        $set: {
          expertise,
          availability,
          packages,
          ratings,
          bio,
          basedOn,
          qualifications,
          reviews,
        },
      },
      { new: true }
    );
    console.log(user)

    const expert = await ParaExpert.findById( paraExpertId );

    await User.findByIdAndUpdate(
      paraExpertId,
      {
        $set: {
          name,
          gender,
          dateOfBirth,
          interests,
          profilePicture,
          phone,
        },
      },
      { new: true }
    );

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

    const user = req.user;
    const userId = user._id;
    const para = await ParaExpert.findOne({ userId });
    const paraExpertId = para._id;

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
      paraExpertId,
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

const getUserById =  asyncHandler(async (req: Request, res: Response) => {
  try{
    const {userId} = req.params
    const user = await User.findById(userId)
    if(!user){
      return res.json(new ApiResponse(ResponseStatusCode.NOT_FOUND,{},"user not found"))
    }
    return res.json(new ApiResponse(ResponseStatusCode.SUCCESS,user,"user found successfully"))
  }catch (error) {
    throw new ApiError(
      ResponseStatusCode.INTERNAL_SERVER_ERROR,
      error.message || "Internal server error"
    );
  }
})

const getNotifications = asyncHandler(async(req:Request, res:Response)=>{
  try {
    const user:any = req.user
    const userId = user._id
    const notifications = await Notifications.find({userId})
    if(!notifications){
      return res.json(
        new ApiResponse(ResponseStatusCode.NOT_FOUND, {}, "notification not found")
      );
    }
    return res.json(new ApiResponse(ResponseStatusCode.SUCCESS, notifications,"notifications found successfully"))
  } catch (error) {
    throw new ApiError(
      ResponseStatusCode.INTERNAL_SERVER_ERROR,
      error.message || "Internal server error"
    );
  }
})


export {
  updateUserDetails,
  updateParaExpertDetails,
  setAvailability,
  getUserById,
  getNotifications,
};
