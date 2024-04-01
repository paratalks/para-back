import mongoose from "mongoose";

const { Schema } = mongoose;

const blogSchema = new Schema(
  {
    id: {
      type: Number,
    },
    category_id: {
      type: Number,
    },
    user_id: {
      type: Number,
    },
    title: {
      type: String,
    },
    slug: {
      type: String,
    },
    description: {
      type: String,
    },
    image_path: {
      type: String,
    },
    featured: {
      type: Number,
    },
    is_approved: {
      type: Number,
    },
    
  },
  { timestamps: true }
);
