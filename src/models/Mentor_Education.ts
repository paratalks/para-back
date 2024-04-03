import mongoose, { Schema } from "mongoose";

const MentorEducationSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    mentor_id: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    institute: {
      type: String,
      default: null,
    },
    subject: {
      type: String,
      default: null,
    },
    image_path: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const MentorEducation = mongoose.model(
  "mentor_education",
  MentorEducationSchema
);

export default MentorEducation;
