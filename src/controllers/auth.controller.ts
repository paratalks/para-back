//import User from "../models/User";
import { User } from "../models/user/user.model";
import { ParaExpert } from "../models/paraExpert/paraExpert.model";
import { NextFunction, Request, RequestHandler, Response } from "express";
import bigPromise from "../middlewares/bigPromise";
import { sendSuccessApiResponse } from "../middlewares/successApiResponse";
import { createCustomError } from "../errors/customAPIError";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import axios from "axios";
import { OTP } from "../models/otp/otp.model";
import { Schema } from "mongoose";
import httpContext from "express-http-context";
import { string } from "zod";

dotenv.config();

const options = {
  expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  httpOnly: true,
};

interface signupObject {
  name: string;
  gender: string;
  dateOfBirth: string;
  phone: string;
} // user id token and user id from token postman -- auth, book appointment
//user-signup make of paraexpert
export const signup: RequestHandler = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        name,
        gender,
        dateOfBirth,
        phone,
      }: {
        name: string;
        gender: string;
        dateOfBirth: string;
        phone: string;
      } = req.body;

      const toStore: signupObject = {
        name,
        gender,
        dateOfBirth,
        phone,
      };

      if (!name || !gender || !phone) {
        return next(
          createCustomError("Name, Email and Password fields are required", 400)
        );
      }

      const token = req.headers.token;
      console.log("tokkk", token);

      const decode: any = jwt.verify(token as string, process.env.JWT_SECRET);

      if (decode.userId) {
        // const existingUser = await User.findOne({ phone, isActive: true });

        // if (existingUser) {
        //   return next(createCustomError("User Already exists", 400));
        // }

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
        res.status(200).cookie("token", data.token, options).send(response);
      } else {
        return res.status(500).send({
          message: "User not authorized to sign-up please redo otp procedure",
        });
      }

      // if (existingUser) {
      //     return next(createCustomError("User Already exists", 400));
      // }

      // const phoneNumberIsActive = await User.findOne({ phone, isActive: true });

      // if (phoneNumberIsActive) {
      //     return next(createCustomError("This phone number is already registered.", 400));
      // }
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
        //interests,
        phone,
        expertise,
        availability,
        pricing,
      }: //profilePicture
      {
        name: string;
        gender: string;
        dateOfBirth: string;
        //interests: string,
        phone: string;
        expertise: string;
        availability: Object;
        pricing: Number;
        //profilePicture: string
      } = req.body;

      const toStore: signupObject = {
        name,
        gender,
        dateOfBirth,
        phone,
      };
      const token = req.headers.token;
      const decode: any = jwt.verify(token as string, process.env.JWT_SECRET);
      console.log(decode);

      if (decode.userId) {
        const newUser = await User.findOneAndUpdate(
          { _id: decode.userId },
          toStore,
          { new: true, runValidators: true }
        );
        await newUser.save();
        console.log(newUser._id);

        const newParaExpert = new ParaExpert({
          userId: newUser._id as Schema.Types.ObjectId,
          expertise,
          availability,
          pricing,
        });
        await newParaExpert.save();
        res
          .status(201)
          .cookie("token",token,options)
          .json({ message: "Paraexpert user created successfully" });
      } else {
        return res.status(500).send({
          message: "User not authorized to sign-up please redo otp procedure",
        });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

export const refreshToken: RequestHandler = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      const message = "Unauthenticated No Bearer";
      return next(createCustomError(message, 401));
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
          return next(createCustomError(message, 401));
        }
      } else {
        const message = "Authentication failed invalid JWT";
        return next(createCustomError(message, 401));
      }
    }

    res
      .status(200)
      .json(sendSuccessApiResponse("Refresh Token Generated", data, 200));
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

export const login: RequestHandler = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      email,
      password,
    }: {
      email: string;
      password: string;
    } = req.body;

    if (!(email && password)) {
      return next(
        createCustomError("Email and Password fields are required", 400)
      );
    }

    const userExists: any = await User.findOne(
      { email: email, isActive: true },
      ["firstName", "lastName", "phoneNumber", "email", "password"]
    );

    if (userExists) {
      const isPasswordCorrect = await userExists.isValidatedPassword(
        password,
        userExists.password
      );

      if (!isPasswordCorrect) {
        return next(createCustomError("Incorrect Password", 401));
      }
      userExists.password = undefined;
      const data: any = { token: userExists.getJwtToken(), userExists };

      return res
        .cookie("token", data.token, options)
        .send(sendSuccessApiResponse("User LoggedIn Successfully!", data, 201));
    } else {
      return next(createCustomError("You're not registered in our app", 400));
    }
  }
);

export const logout = bigPromise(async (req, res, next) => {
  try {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    return res.status(200).json({
      success: true,
      message: "OTP send successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
});

export const sendOTP: RequestHandler = bigPromise(async (req, res) => {
  try {
    const phone = req.body.phone;
    const otp = Math.floor(100000 + Math.random() * 900000);
    const requestID = httpContext.get("requestId");
    /*const response = await axios.get("https://www.fast2sms.com/dev/bulkV2", {
        params: {
          authorization: "rRwh74DHTn0VLYt5nLuwwSc2Ym7yAHDg66kwcsh5thNiBT4DGRyOOm7NWOkW",
          variable_values: `Your otp is ${otp}`,
          route: "otp",
          numbers: "7905132659",
        },
      });*/

    await OTP.create({
      phone: phone,
      otp: otp,
      otpExpiration: new Date(Date.now() + 10 * 60000),
      verified: false,
      requestId: requestID
    });

    return res.status(200).json({
      success: true,
      message: `OTP send successfully ${otp}`,
      requestID: requestID,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
});

export const verifyOTP = bigPromise(async (req, res, next) => {
  const {bodyotp, requestId } = req.body;

  try {
    const { otp, otpExpiration,phone } = await OTP.findOne({ requestId });
    const expirationTimeStamp = otpExpiration.getTime();
    //already exits direct login token and refresh token
    if (bodyotp === otp && Date.now() < expirationTimeStamp) {
      let isNewUser = false;
      let user: any = await User.findOne({ phone });

      if (!user) {
        user = await User.create({
          phone: phone, 
        });
        isNewUser = true;
      }else{
        isNewUser = false;
      }

      const payload = {
        userId: user?._id,
        phone,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRY,
      });

      res.status(200).json({
        success: true,
        message: "OTP verification successfull",
        token: token,
        isNewUser: isNewUser,
      }); //auth token jwt
    } else {
      res.status(400).json({ success: true, message: "Invalid OTP" });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Internal server error",
    });
  }
});
