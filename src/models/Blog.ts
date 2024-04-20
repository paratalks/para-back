import mongoose from "mongoose";

const { Schema } = mongoose;

const blogSchema = new Schema(
  {
    id: {
      type: Number,
    },
    category_id: {
      type: Schema.Types.ObjectId,
      ref: "category"
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "user"
    },
    title: {
      type: String,
      required: [true,"Please provide title"],
    },
    slug: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: [true, "Please provide description"],
    },
    image_path: {
      type: String,
    },
    featured: {
      type: Number,
    },
    is_approved: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

export const blogs = mongoose.model("blogs", blogSchema);
