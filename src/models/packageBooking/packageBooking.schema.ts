import mongoose, { Schema } from "mongoose";

const PackageBookingSchema = new mongoose.Schema(
  {
    packageId: {
      type: Schema.Types.ObjectId,
      ref: "ParaExpert.packages",
      required: true,
      unique:false

    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique:false

    },
    paraExpertId: {
      type: Schema.Types.ObjectId,
      ref: "paraExpert",
      required: true,
      unique:false
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
      type: [String],
      required: false,
    },
    status: {
      type: String,
      enum: ["scheduled","pending","rescheduled","confirmed", "cancelled"],
      default: "pending",
      required: true,
    },
  },
  { timestamps: true }
);

export default PackageBookingSchema;
