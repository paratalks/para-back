import mongoose, { Schema } from "mongoose";

const password_resetsSchema = new mongoose.Schema({
    email: {              //refers to which schema
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
    token:{
        type: String,
        required: [true, "Please provide token"],
    },
    created_at:{
        type: Date,
        default: Date.now(),
    }
})

export const Password_resets = mongoose.model("Password_resets", password_resetsSchema);