import { months } from "moment";
import mongoose, { mongo } from "mongoose";

const { Schema } = mongoose;

const JassCashSchema = new Schema(
  {
    id: {
      type: Number,
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

const JazzCash = mongoose.model("jazzcash_merchant" ,JassCashSchema)

export default JazzCash
