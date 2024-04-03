import mongoose from "mongoose";

const { Schema } = mongoose;

const blogSchema = new Schema(
  {
    id: {
      type: Number,
    },
    category_id: {
      type: Schema.Types.ObjectId,
      ref: "Blog_Category"
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "Users"
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

export const Blogs = mongoose.model("Blogs", blogSchema);
