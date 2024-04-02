import mongoose, { Schema } from "mongoose";

const messagesSchema = new Schema({
    id: {
        type: Number,
        unique: true,
        required: [true, "Id is required"],
    },    
    message: {
        type: String,
        default: null,
    },
    sender_id: {
        type: Number,
        default:null,
    },
    sender_name:{
        type: String,
        default: null,
    },
    receiver_id: {
        type: Number,
        default: null,
    },
    receiver_name:{
        type: String,
        default: null,
    },
}, { timestamps: true });

export const messages = mongoose.model("messages", messagesSchema)