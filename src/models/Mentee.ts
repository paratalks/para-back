import mongoose, { Schema } from "mongoose";

const MenteeSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },
  user_id: {
    type: Schema.Types.ObjectId, //about the type
    default: null,
  },
  description: {
    type: String,
    default: null,
  },
  wallet_id: {
    type: Number,
    default: null,
  },
  wallet_amount: {
    type: Number,
    default: null,
  },
  is_active: {
    type: Boolean, /// doubt about type
    default: false,
  },
  identity_hidden: {
    type: Boolean,
    default: true,
  },

},{timestamps: true});

const Mentee = mongoose.model("mentee", MenteeSchema)

export default Mentee;
