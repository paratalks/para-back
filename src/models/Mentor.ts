import mongoose, { Schema } from "mongoose";

const MentorSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    description: {
      type: String,
      deafault: null,
    },
    payment_type: {
      type: String,
      default: null,
    },
    status: {
      type: Boolean,
      default: false,
    },
    is_profile_completed: {
      type: Boolean,
      default: false,
    },
    is_live: {
      type: Boolean,
      default: false,
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
    level: {
      type: Number,
      default: null,
    },
    fee: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

const Mentor = mongoose.model("mentor", MentorSchema);

export default Mentor;
