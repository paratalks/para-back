import mongoose, { Schema, mongo } from "mongoose";

const MentorCategorySchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    parent_id: {
      type: Schema.Types.ObjectId, ///about its type
      default: null,
    },
    name: {
      type: String,
      default: null,
      required: true,
    },
    slug: {
      type: String,
      default: null,
      required: true,
    },
    image_path: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const MentorCategory = mongoose.model("mentor_category", MentorCategorySchema);

export default MentorCategory;
