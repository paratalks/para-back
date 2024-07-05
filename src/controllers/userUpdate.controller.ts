import { Request, Response } from "express";
import { ApiError } from "../util/apiError";
import { asyncHandler } from "../util/asyncHandler";
import { User } from "../models/user/user.model";
import { ParaExpert } from "../models/paraExpert/paraExpert.model";
import { ApiResponse } from "../util/apiResponse";
import { ResponseStatusCode } from "../constants/constants";
import { paraUpdateObject } from "../constants/types";
import { Notifications } from "../models/notification/notification.model";
import fs from 'fs';
import { S3Client,PutObjectCommand } from '@aws-sdk/client-s3';

const updateUserDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, gender, interests, profilePicture, phone } = req.body as {
      name: String;
      gender: String;
      email:String;
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
          email,
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
    console.log(paraExpertId)
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

// // Configuring AWS SDK
// // Configure S3Client
// const s3Client = new S3Client({
//   region: process.env.AWS_REGION!,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
//   }
// });

// const myBucket = process.env.AWS_S3_BUCKET_NAME;
// // const s3 = new AWS.S3();


// const storage = multerS3({
//   s3: s3Client,
//   bucket: myBucket,
//   acl: 'public-read', // or any other appropriate ACL
//   contentType: multerS3.AUTO_CONTENT_TYPE,
//   key: (req, file, cb) => {
//     cb(null, `${Date.now().toString()}-${file.originalname}`); // Use a unique file name
//   }
// });

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

const myBucket = process.env.AWS_S3_BUCKET_NAME!;

const uploadProfile = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const userID = req.params.userId;
    
    const locaFilePath = req.file.path;
    console.log('local filepath', locaFilePath);

    const fileContent = fs.readFileSync(locaFilePath);

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME, 
      Key: `${Date.now()}_${req.file.originalname}`,
      Body: fileContent,
      ContentType: req.file.mimetype,
    };
    const command = new PutObjectCommand(params);
    const s3Response = await s3Client.send(command);
    const url = `https://${myBucket}.s3.amazonaws.com/${params.Key}`;

    let user;
    if (url) {
      user = await User.findByIdAndUpdate(
        userID,
        {
          profileImage: url,
        },
        {
          new: true,
        }
      );
    }

    fs.unlinkSync(locaFilePath);

    return res.json(new ApiResponse(ResponseStatusCode.SUCCESS, user.profilePicture, "File Uploaded successfully"));
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
