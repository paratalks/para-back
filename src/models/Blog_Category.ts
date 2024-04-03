import mongoose, { mongo } from "mongoose";

const { Schema } = mongoose;

const BlogCategorySchema = new Schema(
  {
    id: {
      type: Number,
      unique: true,
    },
    slug: {
      type: String,
    },
    image_path: {
      type: String,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

const Blog_category = mongoose.model("Blog_category", BlogCategorySchema)

export default Blog_category;