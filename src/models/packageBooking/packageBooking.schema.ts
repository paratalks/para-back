import mongoose, { Schema } from "mongoose";
mongoose.set('strictQuery', false);

const PackageBookingSchema = new mongoose.Schema(
  {
    packageId: {
      type: Schema.Types.ObjectId,
      ref: "ParaExpert.packages",
      required: true,

    },
    packageType:{
      type: String,
      default:'offline',
      enum:['offline','online']
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,

    },
    paraExpertId: {
      type: Schema.Types.ObjectId,
      ref: "paraExpert",
      required: true,
    },
    bookingDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    prescriptionReport: {
      type: String,
      required: false,
    },
    questions: {
      type: String,
      required: false,
    },
    address: {
      type: String,
      required:false,
    },
    status: {
      type: String,
      enum: ["completed","pending","rescheduled","confirmed", "cancelled", "paymentPending"],
      default: "pending",
      required: true,
    },
  },
  { timestamps: true }
);

export default PackageBookingSchema;
