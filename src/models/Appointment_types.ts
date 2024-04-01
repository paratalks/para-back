import mongoose from "mongoose";

const { Schema } = mongoose;

const appointment_typesSchema = new Schema(
  {
    id: {
      type: Number,
    },
    name: {
        type: String,
    },
    is_schedule_required:{
        type: Boolean,
    },
    
  },
  { timestamps: true }
);

export const appointment_types = mongoose.model("appointment_types", appointment_typesSchema)