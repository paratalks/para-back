import mongoose from "mongoose";
import jwt from "jsonwebtoken"

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    interests: {
      type: [String],
    },
    dateOfBirth:{
      type: Date,
    },
    phone:{
      type: String,
      required: true
    },
    refreshToken:{
      type:String,
    }
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
