import mongoose, { Schema } from "mongoose";

const MentorCardDetailsSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique:true,
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
    ref:"Mentor",
  },
});

const Mentor_card_details = mongoose.model("Mentor_card_details", MentorCardDetailsSchema)

export default Mentor_card_details
