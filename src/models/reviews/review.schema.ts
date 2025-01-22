import mongoose, { Schema } from "mongoose";

export const reviewSchema = new Schema(
  {
    paraExpertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "paraExpert",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    review:{
        type: String,
    },
    rating:{
        type: Number,
    }
  },
  { timestamps: true }
);

export default reviewSchema;
