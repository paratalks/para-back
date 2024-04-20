import mongoose, { Schema } from "mongoose";

const terms_conditionsSchema = new Schema({
    id:{
        type: Number,
        unique: true,
        required: [true, "Id is required"],
    },
    value:{
        type: String,
        default:null,
    }
},{timestamps: true});

export const terms_conditions = mongoose.model("terms_conditions", terms_conditionsSchema)