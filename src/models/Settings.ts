import mongoose, { Schema } from "mongoose";

const settingsSchema = new Schema({
    id:{
        type: Number,
        unique: true,
        required: [true, "Id is required"],
    },
    name:{
        type: String,
        required: [true, "Name is required"],
    },
    display_name:{
        type: String,
        default:null,
    },
    value:{
        type: String,
        default:null,
    },
    category:{
        type: String,
        default:null,
    },
    is_specific:{
        type: Boolean,
        default: false,
    },

},{timestamps: true});

export const settings = mongoose.model("settings", settingsSchema)