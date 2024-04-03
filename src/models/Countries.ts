import mongoose from "mongoose";

const { Schema } = mongoose;

const CountriesSchema = new Schema(
  {
    id: {
      type: Number,
      unique:true,
    },
    name: {
      type: String,
      required: true,
    },
    iso_code_3: {
      type: String,
      required: true,
      match: [/^[a-z]{2}-[A-Z]{2}$/, "Please provide iso code"],
      default: null,
    },
    iso_code_2: {
      type: String,
      required: true,
      match: [/^[a-z]{2}-[A-Z]{2}$/, "Please provide iso code"],
      default: null,
    },
    phoneCode: {
      type: String,
      default: null,
    },
    capital: {
      type: String,
      default: null,
    },
    currency: {
      type: String,
      default: null,
    },
    currency_symbol: {
      type: String,
      default: null,
    },
    tld: {
      type: String,
      default: null,
    },
    native: {
      type: String,
      default: null,
    },
    region: {
      type: String,
      default: null,
    },
    is_Active: {
      type: Boolean,
      default: false,
    },
    subregion: {
      type: String,
      default: null,
    },
    timezones: {
      type: String,
      default: null,
    },
    translations: {
      type: String,
      default: null,
    },
    latitude: {
      type: Number,
      default: null,
    },
    longitude: {
      type: Number,
      default: null,
    },
    emoji: {
      // doubt
    },
    emojiU: {
      //
    },
    flag: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Countries = mongoose.model("Countries", CountriesSchema)

export default Countries;
