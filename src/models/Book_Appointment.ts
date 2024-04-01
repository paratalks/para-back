import mongoose from "mongoose";

const { Schema } = mongoose;

const BookAppointmentSchema = new Schema(
  {
    id: {
      type: Number,
      unique: true,
    },
    mentee_id: {
      type: Schema.Types.ObjectId,
      ref: "mentee",
      default: null,
    },
    mentor_id: {
      type: Schema.Types.ObjectId,
      ref: "mentor",
      default: null,
    },
    date: {
      type: Date,
      default: null,
    },
    time:{
        type:String,
        default: null
    },
    end_time:{
        type: String,
        default: null,
    },
    payment:{
        type:Number,
        default: null,
    },
    is_paid:{
        type: Boolean,
        default: false,
    },
    payment_status_code:{
        type:String,
        default: null,
    },
    payment_response_msg:{
        type:String,
        default: null,
    },
    is_archive:{
        type:Boolean,
        default: null,
    },
    payment_order_ref:{
        type:String,
        default: null,
    },
    payment_id:{
        type: Number,
        default: true,
    },
    appointment_type_string:{
        type:String,
        default: null,
    },
    appointment_type_id:{
        type:Schema.Types.ObjectId,
        default: null,
    },
    questions:{
        type:String,
        default: true,
    },
    file:{
        type: String,
        default: null
    },
    file_type:{
        type:String,
        default: null,
    },
    appointment_status:{
        type:Boolean, 
        default: false
    },
    refund:{
        type: Boolean,
        default: false
    },
    notes_consultant:{
        type: String,
        default: null,
    },
    file_consultant:{
        type: String,
        default: null
    },
    filetype_consultant:{
        type:String,
        default: null,
    }
  },
  { timestamps: true }
);
