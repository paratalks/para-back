import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
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
    phone: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

userSchema.methods.getJwtToken = function () {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const tokenMap: any = { userId: this._id, phone: this.phone };
  console.log(tokenMap);

  return jwt.sign(tokenMap, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRY,
  });
};

export default userSchema;
