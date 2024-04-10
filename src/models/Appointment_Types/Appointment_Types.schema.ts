import mongoose from "mongoose";


const Appointment_TypesSchema = new mongoose.Schema(
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

export default Appointment_TypesSchema;