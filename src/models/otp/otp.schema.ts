import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    match: [/^([+][9][1]){0,1}([6-9]{1})([0-9]{9})$/, "Please provide valid phone number"],
  },
  otp: {
    type: String,
    required: true,
  },
  otpExpiration: {
    type: Date,
    required: true,
    expires: 0,
  },
  requestId: {
    type: String,
  },
  verified: {
    type: Boolean,
    default: false,
  },
});

export default otpSchema;
