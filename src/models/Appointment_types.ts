import mongoose from "mongoose";

const { Schema } = mongoose;

const appointment_typesSchema = new Schema(
  {
    id: {
      type: Number,          //autoincrement, req. true?
      unique: true
    },
    name: {
        type: String,
        required: true
    },
    is_schedule_required:{
        type: Boolean,
    },
    
  },
  { timestamps: true }
);

export const Appointment_types = mongoose.model("Appointment_types", appointment_typesSchema)