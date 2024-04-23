import mongoose, { Schema } from "mongoose";

const appointmentsSchema = new mongoose.Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  paraExpertId: {
    type: Schema.Types.ObjectId,
    ref: "paraExpert",
  },
  date:{
    type: Date,
  },
  startTime:{
    type: String,
  },
  endTime:{
    type:String,
  },
  status:{
      type:String,
      enum:["scheduled","cancelled","completed"],
      default:"scheduled",
  },
},{timestamps: true});

export default appointmentsSchema;
