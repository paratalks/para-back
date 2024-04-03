import mongoose, { Schema } from "mongoose";

const newsletter_listSchema = new Schema({
    id: {
        type: Number,
        unique: true,
        required: [true, "Id is required"],
    },
    email: {
        type: String,
        required: [true, "Please provide email"],
        unique: true,
        match: [
            /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/,
            "Please provide valid email",
        ],
        trim: true,
        lowercase: true,
    },
    is_subscriber: {
        type: Boolean,
        default: true,
    }
}, { timestamps: true });

export const Newsletter_list = mongoose.model("Newsletter_list", newsletter_listSchema)