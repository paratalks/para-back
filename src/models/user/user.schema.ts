import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
      unique: true,
    },
    dateOfBirth: {
      type: Date,
      required: false,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: false,
    },
    interests: {
      type: [String],
      required: false,
    },
    profilePicture: {
      type: String,
    },
    phone: {
      type: String,
      required: true,
      match: [
        /^([+][9][1]){0,1}([6-9]{1})([0-9]{9})$/,
        "Please provide valid phone number",
      ],
    },
    refreshToken: {
      type: String,
      required: false,
    },
    fcmToken: {
      //remove, add token
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.methods.getJwtToken = function () {
  const tokenMap: any = { userId: this._id, phone: this.phone };

  return jwt.sign(tokenMap, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRY,
  });
};

export default userSchema;
