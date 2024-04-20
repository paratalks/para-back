import mongoose, {Schema } from "mongoose";

const rolesSchema = new Schema({
    id:{
        type: Number,
        unique: true,
        required: [true, "Id is required"],
    },
    name:{
        type: String,
        default:null,
        required: [true, "Name is required"],
    },
    slug:{
        type: String,
        default:null,
    },
    is_active:{
        type: Boolean,
        default: true,
    },
},{timestamps: true});

export const roles = mongoose.model("roles", rolesSchema)