import { User } from "../models/user/user.model";
import { ParaExpert } from "../models/paraExpert/paraExpert.model";
import { NextFunction, Request, RequestHandler, Response } from "express";
import bigPromise from "../middlewares/bigPromise";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { OTP } from "../models/otp/otp.model";
import { Schema } from "mongoose";
import { ApiError } from "../util/apiError";
import { ApiResponse } from "../util/apiResponse";
import { ResponseStatusCode } from "../constants/constants";
import { signupObject, parasignupObject } from "../constants/types";
import { fcm, notification, sendNotif } from "../util/notification.util";
import { sendOTPUtil } from "../util/sendOtp";
dotenv.config();

const options = {
  expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  httpOnly: true,
};

export const signup: RequestHandler = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        name,
        gender,
        email,
        dateOfBirth,
        interests,
        profilePicture,
        fcmToken,
      }: signupObject = req.body;

      if (
        !name ||
        !gender ||
        !email ||
        !dateOfBirth ||
        !interests ||
        !fcmToken
      ) {
        throw new ApiError(
          ResponseStatusCode.BAD_REQUEST,
          "All fields are required"
        );
      }

      const user: any = req.user;

      if (user && user.name && user.gender && user.dateOfBirth) {
        return res
          .status(400)
          .json(new ApiResponse(400, { message: "User already exist" }));
        throw new ApiError(400, "User already exist");
      }

      const toStore: signupObject = {
        name,
        gender,
        email,
        dateOfBirth,
        interests,
        profilePicture,
        fcmToken,
      };

      if (user) {
        const updatedUser: any = await User.findOneAndUpdate(
          { _id: user._id },
          toStore,
          { new: true, runValidators: true }
        );
        await updatedUser.save();
        const data: any = { token: updatedUser.getJwtToken(), updatedUser };

        await sendNotif(
          updatedUser.fcmToken,
          "Welcome to Paratalks",
          "Open the doors to a world of peace and serenity!",
          user._id
        );

        const createNotification = await notification(
          user._id,
          "Welcome to Paratalks",
          "Open the doors to a world of peace and serenity!",
          null,
          null
        );

        if (!createNotification) {
          throw new ApiError(
            ResponseStatusCode.BAD_REQUEST,
            "Failed to create notification"
          );
        }

        res.json(new ApiResponse(200, data, "User Registered Successfully!"));
      } else {
        throw new ApiError(
          ResponseStatusCode.INTERNAL_SERVER_ERROR,
          "User not authorized to sign-up please redo otp procedure"
        );
      }
    } catch (error) {
      throw new ApiError(401, error?.message || "Failure in User registration");
    }
  }
);

export const paraSignup: RequestHandler = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        name,
        gender,
        email,
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
      }: parasignupObject = req.body;

      const user: any = req.user;

      if (user && user.name && user.gender && user.dateOfBirth) {
        return res
          .status(400)
          .json(new ApiResponse(400, { message: "User already exist" }));
        throw new ApiError(400, "User already exist");
      }

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
        email,
        dateOfBirth,
        interests,
        profilePicture,
        fcmToken,
      };

      if (user) {
        const newUser: any = await User.findOneAndUpdate(
          { _id: user._id },
          toStore,
          { new: true, runValidators: true }
        );
        await newUser.save();
        const token: any = newUser.getJwtToken();

        const paraExpert = new ParaExpert({
          userId: newUser?._id as Schema.Types.ObjectId,
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

        await sendNotif(
          newUser.fcmToken,
          "Welcome to Paratalks",
          "Open the doors to a world of peace and serenity!",
          newUser?.userId
        );

        const createNotification = await notification(
          newUser._id,
          "Welcome to Paratalks",
          "Open the doors to a world of peace and serenity!",
          null,
          null
        );

        if (!createNotification) {
          throw new ApiError(
            ResponseStatusCode.BAD_REQUEST,
            "Failed to create notification"
          );
        }

        const sendNotification = fcm(createNotification._id);

        if (!sendNotification) {
          throw new ApiError(
            ResponseStatusCode.BAD_REQUEST,
            "Failed to send notification"
          );
        }

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
        res.json(
          new ApiResponse(
            ResponseStatusCode.UNAUTHORIZED,
            "User not authorized to sign-up please redo otp procedure"
          )
        );
      }
    } catch (error) {
      res.json(
        new ApiResponse(
          ResponseStatusCode.INTERNAL_SERVER_ERROR,
          error?.message
        )
      );
    }
  }
);

export const refreshToken: RequestHandler = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      const message = "Unauthenticated No Bearer";
      throw new ApiError(401, message);
    }

    let data: any;
    const token = authHeader.split(" ")[1];
    try {
      const payload: string | jwt.JwtPayload | any = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

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
      new ApiResponse(
        ResponseStatusCode.INTERNAL_SERVER_ERROR,
        "OTP send successfully"
      )
    );
  }
});

export const sendOTP: RequestHandler = bigPromise(async (req, res) => {
  try {
    const { phone, fcmToken } = req.body;

    if (!phone) {
      return res.status(400).json(
        new ApiResponse(ResponseStatusCode.BAD_REQUEST, {
          message: "Mobile number is required",
        })
      );
    }

    let user = await User.findOneAndUpdate(
      { phone },
      { fcmToken },
      { new: true }
    );

    const otpResponse = await sendOTPUtil(phone);

    return res.json(otpResponse);
  } catch (error) {
    return res
      .status(500)
      .json(
        new ApiResponse(
          ResponseStatusCode.INTERNAL_SERVER_ERROR,
          "Failed to send OTP",
          error.message
        )
      );
  }
});

export const handleMobileVerificationAndOTP: RequestHandler = bigPromise(
  async (req: Request, res: Response) => {
    try {
      const { phone, fcmToken } = req.body;

      if (!phone) {
        return res.status(400).json(
          new ApiResponse(ResponseStatusCode.BAD_REQUEST, {
            message: "Mobile number is required",
          })
        );
      }

      let user = await User.findOne({ phone });

      if (!user) {
        return res
          .status(403)
          .json(
            new ApiResponse(
              ResponseStatusCode.FORBIDDEN,
              false,
              "This mobile number is not an authorized user"
            )
          );
      }

      const userId = user._id;
      const paraExpert = await ParaExpert.findOne({ userId });

      if (!paraExpert) {
        return res
          .status(403)
          .json(
            new ApiResponse(
              ResponseStatusCode.FORBIDDEN,
              false,
              "This mobile number is not authorized Para Expert"
            )
          );
      }
      user.fcmToken = fcmToken;
      await user.save();

      const otpResponse = await sendOTPUtil(phone);
      return res.json(otpResponse);
    } catch (error) {
      console.error(error);
      res.status(500).json(
        new ApiResponse(ResponseStatusCode.INTERNAL_SERVER_ERROR, {
          message: error.message,
        })
      );
    }
  }
);

export const verifyOTP = bigPromise(async (req, res, next) => {
  const { requestId, otp: userOtp } = req.body;

  try {
    const otpRecordPromise = OTP.findOne({ requestId }).exec();
    let userPromise;

    const otpRecord = await otpRecordPromise;

    if (
      !otpRecord ||
      otpRecord.verified ||
      Date.now() >= otpRecord.otpExpiration.getTime()
    ) {
      return res.json(
        new ApiResponse(
          ResponseStatusCode.BAD_REQUEST,
          "Invalid or expired OTP"
        )
      );
    }

    if (userOtp !== otpRecord.otp) {
      return res.json(
        new ApiResponse(ResponseStatusCode.BAD_REQUEST, "Invalid OTP")
      );
    }

    userPromise = User.findOne({ phone: otpRecord.phone }).exec();

    let user = await userPromise;
    let isNewUser = false;

    if (!user) {
      user = await User.create({ phone: otpRecord.phone });
      isNewUser = true;
    }

    const payload = {
      userId: user._id,
      phone: otpRecord.phone,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRY,
    });

    await OTP.findOneAndUpdate(
      { requestId },
      { $set: { verified: true } },
      { new: true }
    );

    res.json(
      new ApiResponse(
        ResponseStatusCode.SUCCESS,
        { token, isNewUser, userId: user._id },
        "OTP verification successful"
      )
    );
  } catch (error) {
    res.json(
      new ApiResponse(
        ResponseStatusCode.INTERNAL_SERVER_ERROR,
        "Internal server error"
      )
    );
  }
});
