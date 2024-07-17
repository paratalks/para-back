import { Request, Response } from "express";
import { ApiError } from "../util/apiError";
import { asyncHandler } from "../util/asyncHandler";
import { User } from "../models/user/user.model";
import { ParaExpert } from "../models/paraExpert/paraExpert.model";
import { ApiResponse } from "../util/apiResponse";
import { ResponseStatusCode } from "../constants/constants";
import { paraUpdateObject } from "../constants/types";
import { Notifications } from "../models/notification/notification.model";
import { S3Client,PutObjectCommand,GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import axios from "axios";

const updateUserDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { name, email, gender, interests, profilePicture, phone, dateOfBirth } = req.body;

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
      ).select('-password -refreshToken');

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
      console.log(error);
    }
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
      experience,
      consultancy,
      socials
    }: paraUpdateObject = req.body; 

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
          experience,
          consultancy,
          socials
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

const setAvailability = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { availability } = req.body as {
      availability: Array<{ day: number; slots: { chat: string[]; video_call: string[]; audio_call: string[] } }>;
    };

    // const user = req.;
    const userId = req.params.paraExpId;
    const para = await ParaExpert.findById(userId);

    const paraExpertId = userId;
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
    const notifications = await Notifications.find({ userId: userId });
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

const dev = asyncHandler(async(req:Request, res:Response)=>{
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
    return res.json(new ApiResponse(ResponseStatusCode.SUCCESS,para,"updated successfully"))
  } catch (error) {
    throw new ApiError(
      ResponseStatusCode.INTERNAL_SERVER_ERROR,
      error.message || "Internal server error"
    );
  }
})

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

const bucketName = process.env.AWS_S3_BUCKET_NAME!;

// const uploadProfile = async (req: Request, res: Response) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json(new ApiResponse(ResponseStatusCode.BAD_REQUEST, null, 'No file uploaded'));
//     }
//     const userID = req.params.userId;
//     const isUser = await User.findById(userID);
//     if (!isUser) {
//       return res.status(404).json(new ApiResponse(ResponseStatusCode.NOT_FOUND, null, 'User not found'));
//     }
//     const filename = `${Date.now()}-${req.file.originalname}`;
//     const contentType = req.file.mimetype;
//     const fileContent = req.file.buffer;


//     const putCommand = new PutObjectCommand({
//       Bucket: bucketName,
//       Key: `uploads/user-profile/${filename}`,
//       Body: fileContent,
//       ContentType: contentType,
//     });

//     const uploadUrl = await getSignedUrl(s3Client, putCommand, { expiresIn: 100 });

//     await axios.put(uploadUrl, fileContent, {
//       headers: {
//         'Content-Type': contentType
//       }
//     });

//     const getCommand = new GetObjectCommand({
//       Bucket: bucketName,
//       Key: `uploads/user-profile/${filename}`,
//     });
//     const accessUrl = await getSignedUrl(s3Client, getCommand,  { expiresIn: 8640 });

//   return res.json(new ApiResponse(ResponseStatusCode.SUCCESS, accessUrl, "Profile Pic Uploaded successfully"));
//   } catch (error) {
//         console.error('Error uploading file:', error);
//         throw new ApiError(
//           ResponseStatusCode.INTERNAL_SERVER_ERROR,
//           error.message || "Internal server error"
//         );
//       }
// };

const uploadProfile = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json(new ApiResponse(ResponseStatusCode.BAD_REQUEST, null, 'No file uploaded'));
    }

    const userID = req.params.userId;
    const isUser = await User.findById(userID);
    if (!isUser) {
      return res.status(404).json(new ApiResponse(ResponseStatusCode.NOT_FOUND, null, 'User not found'));
    }

    const filename = `${Date.now()}-${req.file.originalname}`;
    const contentType = req.file.mimetype;
    const fileContent = req.file.buffer;

    const putCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: `uploads/user-profile/${filename}`,
      Body: fileContent,
      ContentType: contentType,
      ACL: 'public-read',
    });

    await s3Client.send(putCommand);

    const accessUrl = `https://${bucketName}.s3.${process.env.AWS_REGION!}.amazonaws.com/uploads/user-profile/${filename}`;

    return res.json(new ApiResponse(ResponseStatusCode.SUCCESS, accessUrl, "Profile Pic Uploaded successfully"));
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new ApiError(
      ResponseStatusCode.INTERNAL_SERVER_ERROR,
      error.message || "Internal server error"
    );
  }
};


export {
  updateUserDetails,
  updateParaExpertDetails,
  setAvailability,
  getUserById,
  getNotifications,
  uploadProfile,
  dev
};
