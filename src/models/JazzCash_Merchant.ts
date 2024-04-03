import { months } from "moment";
import mongoose, { mongo } from "mongoose";

const { Schema } = mongoose;

const JassCashSchema = new Schema(
  {
    id: {
      type: Number,
      unique:true,
      required: true,
    },
    merchant_id: {
      type: String,
    },
    password: {
      type: String,
    },
    hash: {
      type: String, //why hash and pass different
    },
  },
  { timestamps: true }
);

const JazzCash_merchant = mongoose.model("JazzCash_merchant" ,JassCashSchema)

export default JazzCash_merchant
