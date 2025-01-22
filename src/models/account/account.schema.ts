import mongoose, { Schema } from "mongoose";

const accountSchema = new mongoose.Schema(
  {
    paraExpertId: {
      type: Schema.Types.ObjectId,
      ref: "paraExpert",
      required: true,
    },
    accountHolderName: {
      type: String,
      required: true,
    },
    accountNumber: {
      type: Number,
      required: true,
    },
    bankName: {
      type: String,
      required: true,
    },
    ifscCode: {
      type: String,
      required: true,
    },
    branchName: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      default: 'active',
      required: false,
    },
  },
  { timestamps: true }
);


export default accountSchema;
