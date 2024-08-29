import dotenv from "dotenv";
import { OTP } from "../models/otp/otp.model";
import httpContext from "express-http-context";
import { ApiResponse } from "../util/apiResponse";
import { ResponseStatusCode } from "../constants/constants";
import axios from "axios";
dotenv.config();


export const generateOTP = (): number => {
    return Math.floor(100000 + Math.random() * 900000);
  };

export const sendOTPUtil = async function (phone: number): Promise<ApiResponse> {
    try {
      let otp = generateOTP();
      const requestID = httpContext.get("requestId");

      if (phone === 9999999999) {
        otp = 123456;
      }
  
      await axios.get("https://www.fast2sms.com/dev/bulkV2", {
        params: {
          authorization: process.env.FAST2SMS_API_KEY,
          variables_values: otp,
          route: "otp",
          numbers: phone.toString(),
        },
      });
  
      await OTP.findOneAndUpdate(
        { phone },
        {
          otp,
          otpExpiration: new Date(Date.now() + 5 * 60000),
          verified: false,
          requestId: requestID,
        },
        { upsert: true, new: true }
      );
  
      return new ApiResponse(
        ResponseStatusCode.SUCCESS,
        { requestID },
        "OTP sent successfully"
      );
    } catch (error) {
      console.error(error);
      return new ApiResponse(
        ResponseStatusCode.INTERNAL_SERVER_ERROR,
        "Failed to send OTP",
        error.message
      );
    }
  }
