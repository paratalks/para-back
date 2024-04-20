import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    interests: {
      type: [String],
    },
  },
  { timestamps: true }
);

export default userSchema;
