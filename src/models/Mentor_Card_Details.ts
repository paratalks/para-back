import mongoose, { Schema } from "mongoose";

const MentorCardDetailsSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },
  account_title: {
    type: String,
  },
  account_number: {
    type: String,
  },
  bank: {
    type: String,
  },
  mentor_id: {
    type: Schema.Types.ObjectId,
  },
});

const MentorCardDetails = mongoose.model("mentor_card_details", MentorCardDetailsSchema)

export default MentorCardDetails
