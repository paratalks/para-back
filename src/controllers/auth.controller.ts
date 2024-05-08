import { User } from "../models/user/user.model";
import { ParaExpert } from "../models/paraExpert/paraExpert.model";
import { NextFunction, Request, RequestHandler, Response } from "express";
import bigPromise from "../middlewares/bigPromise";
import { sendSuccessApiResponse } from "../middlewares/successApiResponse";
import jwt from "jsonwebtoken";
import { OTP } from "../models/otp/otp.model";
import { Schema } from "mongoose";
import httpContext from "express-http-context";
import { ApiError } from "../util/apiError";
import { ApiResponse } from "../util/apiResponse";
import { ResponseStatusCode } from "../constants/constants";

const options = {
  expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  httpOnly: true,
};

interface signupObject {
  name: string;
  gender: string;
  dateOfBirth: Date;
} 

interface parasignupObject {
  name: string;
  gender: string;
  dateOfBirth: Date;
  interests: string;
  expertise: string;
  availability: { day: number; slots: String }[];
  pricing: Number;
  profilePicture: string;
}

export const signup: RequestHandler = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        name,
        gender,
        dateOfBirth,
      }: signupObject = req.body;

      

      if (!name || !gender) {
          throw new ApiError(
            ResponseStatusCode.BAD_REQUEST,
            "All fields are required"
          );
      }

      const token = req.headers.token;
      console.log("tokkk", token);

      const decode: any = jwt.verify(token as string, process.env.JWT_SECRET);

      const user = await User.findOne({ _id: decode.userId });

      // if (user && user.name && user.gender && user.dateOfBirth ) {
      //   return res.status(400).json( new ApiResponse(400, {message: "User already exist"}))
      //   throw new ApiError(400, "User already exist");
      // }

      const toStore: signupObject = {
        name,
        gender,
        dateOfBirth,
      };

      if (decode.userId) {

        const user: any = await User.findOneAndUpdate(
          { _id: decode.userId },
          toStore,
          { new: true, runValidators: true }
        );
        user.save();
        const data: any = { token: user.getJwtToken(), user };

        const response = sendSuccessApiResponse(
          "User Registered Successfully!",
          data
        );
        res.json(new ApiResponse(200, response));
      } else {
        throw new ApiError(
          ResponseStatusCode.INTERNAL_SERVER_ERROR,
          "User not authorized to sign-up please redo otp procedure"
        );
      }
    } catch (error) {
      console.log(error);
    }
  }
);

export const paraSignup: RequestHandler = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        name,
        gender,
        dateOfBirth,
        interests,
        expertise,
        availability,
        pricing,
        profilePicture,
      }: parasignupObject = req.body;

      const token = req.headers.token;
      const decode: any = jwt.verify(token as string, process.env.JWT_SECRET);
      // console.log(decode);

      const user = await User.findOne({ _id: decode.userId });

      // if (user && user.name && user.gender && user.dateOfBirth ) {
      //   return res.status(400).json( new ApiResponse(400, {message: "User already exist"}))
      //   throw new ApiError(400, "User already exist");
      // }

      if (
        availability.filter((item) => item.day < 0 || item.day > 6).length > 0
      ) {
        return res.json(
          new ApiResponse(ResponseStatusCode.BAD_REQUEST, "Invalid day")
        );
      }

      const toStore: signupObject = {
        name,
        gender,
        dateOfBirth,
      };

      if (decode.userId) {
        const newUser = await User.findOneAndUpdate(
          { _id: decode.userId },
          toStore,
          { new: true, runValidators: true }
        );
        await newUser.save();

        const paraExpert = new ParaExpert({
          userId: newUser?._id as Schema.Types.ObjectId,
          interests,
          expertise,
          availability,
          pricing,
          profilePicture,
        });

        await paraExpert.save();

        res
          .cookie("token", token, options)
          .json(
            new ApiResponse(
              ResponseStatusCode.SUCCESS,
              paraExpert,
              "Paraexpert user created successfully"
            )
          );
      } else {
        res.json(new ApiResponse(
          ResponseStatusCode.UNAUTHORIZED,
          "User not authorized to sign-up please redo otp procedure"
        ));
      }
    } catch (error) {
      res.json(new ApiResponse(ResponseStatusCode.INTERNAL_SERVER_ERROR, error?.message));
    }
  }
);

export const refreshToken: RequestHandler = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      const message = "Unauthenticated No Bearer";
      throw new ApiError(401,message);
    }

    let data: any;
    const token = authHeader.split(" ")[1];
    try {
      const payload: string | jwt.JwtPayload | any = jwt.verify(
        token,
        process.env.JWT_SECRET
      );
      console.log(payload);

      data = await getNewToken(payload);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        const payload: any = jwt.decode(token, { complete: true }).payload;
        data = await getNewToken(payload);

        if (!data) {
          const message = "Authentication failed invalid JWT";
          throw new ApiError(ResponseStatusCode.UNAUTHORIZED, message);
        }
      } else {
        const message = "Authentication failed invalid JWT";
        throw new ApiError(ResponseStatusCode.UNAUTHORIZED, message);
      }
    }
    res.json(
      new ApiResponse(
        ResponseStatusCode.SUCCESS,
        data,
        "Refresh Token Generated"
      )
    );
  }
);

const getNewToken = async (payload: any) => {
  const isUser = payload?.id ? true : false;
  console.log(isUser);

  let data: any;
  if (isUser) {
    const user: any = await User.findOne({
      isActive: true,
      _id: payload.userId,
    });
    if (user) {
      data = { token: user.generateJWT() };
    }
  }
  return data;
};

export const logout = bigPromise(async (req, res, next) => {
  try {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    return res.json(
      new ApiResponse(ResponseStatusCode.SUCCESS, "OTP send successfully")
    );
  } catch (error) {
    return res.json(
      new ApiResponse(ResponseStatusCode.INTERNAL_SERVER_ERROR, "OTP send successfully")
    );
  }
});

export const sendOTP: RequestHandler = bigPromise(async (req, res) => {
  try {
    const phone = req.body.phone;
    const otp = Math.floor(100000 + Math.random() * 900000);
    const requestID = httpContext.get("requestId");
    
      if(await OTP.findOne({phone})){
        const newotp = await OTP.findOneAndUpdate(
          { phone },
          {
            otp: otp,
            otpExpiration: new Date(Date.now() + 10 * 60000),
            verified: false,
            requestId: requestID,
          },
          {new:true}
        );
      }
      else{
        await OTP.create({
          phone: phone,
          otp: otp,
          otpExpiration: new Date(Date.now() + 10 * 60000),
          verified: false,
          requestId: requestID,
        });
      }

    

    return res.json(
      new ApiResponse(
        ResponseStatusCode.SUCCESS,
        { requestID },
        `OTP send successfully ${otp}`
      )
    );
  } catch (error) {
    console.log(error)
    return res.json(
      new ApiResponse(ResponseStatusCode.INTERNAL_SERVER_ERROR, "Failed to send OTP")
    );
  }
});

export const verifyOTP = bigPromise(async (req, res, next) => { 
  const { requestId } = req.body;
    const { otp, otpExpiration, phone, verified } = await OTP.findOne({
      requestId,
    });

  try {
    const expirationTimeStamp = otpExpiration.getTime();
    if (req.body.otp === otp && Date.now() < expirationTimeStamp && !verified) {
      let isNewUser = false;
      let user: any = await User.findOne({ phone });

      if (!user) {
        user = await User.create({
          phone: phone, 
        });
        isNewUser = true;   // signup
      }

      const payload = {
        userId: user?._id,
        phone,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRY,
      });

      const updateotp = await OTP.findOneAndUpdate(
        { requestId },
        { $set: { verified: true } },
        { new: true }
      );

      res.json(
        new ApiResponse(
          ResponseStatusCode.SUCCESS,
          { token, isNewUser },
          "OTP verification successfull"
        )
      ); //auth token jwt
    } else {
      res.json(new ApiResponse(ResponseStatusCode.BAD_REQUEST, "Invalid OTP"));
    }
  } catch (error) {
    res.json(
      new ApiResponse(ResponseStatusCode.INTERNAL_SERVER_ERROR, "Internal server error")
    );
  }
});


