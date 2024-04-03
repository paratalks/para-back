import mongoose, { Schema } from "mongoose";

const MentorEducationSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique:true,
      required: true,
    },
    mentor_id: {
      type: Schema.Types.ObjectId,
      ref:"Mentor",
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

const Mentor_education = mongoose.model(
  "Mentor_education",
  MentorEducationSchema
);

export default Mentor_education;
