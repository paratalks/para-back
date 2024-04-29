import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
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
  requestId:{
    type:String
  },
  verified:{
    type: Boolean,
    default: false
  }
});

export default otpSchema;