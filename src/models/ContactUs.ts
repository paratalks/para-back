import mongoose from "mongoose";

const { Schema } = mongoose;

const ContactUsSchema = new Schema(
  {
    id: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: [true, "Please provide email"],
      match: [
        /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/,
        "Please provide valid email",
      ],
      trim: true,
      lowercase: true,
    },
    message: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const ContactUs = mongoose.model("ContactUs", ContactUsSchema)

export default ContactUs;
