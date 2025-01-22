import { Document, Model } from "mongoose";

export interface otpTypes {
    phone: String,
    otp: String,
    otpExpiration: Date,
    requestId: String,
    verified: Boolean
}

export interface otpDocument extends otpTypes, Document {}

export interface otpModel extends Model<otpTypes> {};

