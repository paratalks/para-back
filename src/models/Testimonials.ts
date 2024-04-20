import mongoose, {Schema} from "mongoose";

const testimonialsSchema = new Schema({
    id:{
        type: Number,
        unique: true,
        required: [true, "Id is required"],
    },
    name:{
        type: String,
        defuault:null,
        required: [true, "Name is required"],
    },
    description:{
        type: String,
    },
    image_path:{
        type: String,
        default:null,
    },
    is_featured:{
        type: Boolean,
        default: false,
    },

},{timestamps: true});

export const testimonials = mongoose.model("testimonials", testimonialsSchema)