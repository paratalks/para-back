import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    dateOfBirth:{
      type: Date,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    interests: {
      type: [String],
    },
    phone:{
      type: String,
    },
  },
  { timestamps: true }
);

export default userSchema;
