import mongoose, { Schema } from "mongoose";
import { BookingType } from "../../util";

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
    required:true,
  },
  startTime:{
    type: String,
    required:true,
  },
  endTime:{
    type:String,
    required:true,
  },
  status:{
      type:String,
      enum: ["completed","pending","rescheduled","confirmed", "cancelled","ongoing"],
      default: "pending",
  },
  appointmentMode: {
    type: String,
    enum: ["online", "offline"],
    default: "online",
  },
  appointmentMethod: {
    type: String,
    enum: ["chat", "video_call", "audio_call", "offline_package"],
    default: "chat",
  },
  callToken:{
    type:String,
  },
  problem:{
    type:[String],
  },
  reason:{
    type:String,
  }
},{timestamps: true});

export default appointmentsSchema;
