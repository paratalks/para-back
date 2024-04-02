import mongoose from "mongoose";

const { Schema } = mongoose;

const CitiesSchema = new Schema(
  {
    id: {
      type: Number,
      unique: true,
    },
    name: {
      type: String,
    },
    state_id: {
      type: Schema.Types.ObjectId,
    },
    country_id: {
      type: Schema.Types.ObjectId,
    },
    latitude: {
      type: Number,
      default: null,
    },
    code: {
      type: Number,
      default: null,
    },
    is_active: {
      type: Boolean, // doubt in db Int,
      default: false,
    },
    longitude: {
      type: Number,
      default: null,
    },
    flag: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Cities = mongoose.model("Cities", CitiesSchema);

export default Cities;


