import mongoose, {Schema} from "mongoose";

const permissionsSchema = new Schema({
    id:{
        type: Number,
        unique: true,
        required: [true, "Id is required"],
    },
    name:{
        type: String,
        required: [true, "Name is required"],
        default:null,
    },
    slug:{
        type: String,
        required: [true, "Slug is required"],
        default:null,
    },
},{timestamps: true});

export const permissions = mongoose.model("permissions", permissionsSchema)