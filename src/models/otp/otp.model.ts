import { model } from "mongoose";
import otpSchema from "./otp.schema";
import { otpDocument } from "./otp.types";


export const OTP = model<otpDocument>(
  "otp",
  otpSchema
);
