import mongoose, {Schema} from "mongoose";

const payment_methodsSchema = new Schema({
    id:{
        type: Number,
        unique: true,
        required: [true, "Id is required"],
    },
    name:{
        type: String,
        required: [true, "Name is required"],
    },
    description:{
        type: String,
    },
    image_path:{
        type: String,
    },
    is_active:{
        type: Boolean,
        default: true,
    },
    is_app:{
        type: Boolean,
        default: false,
    },
    is_web:{
        type: Boolean,
        default: false,
    },
    is_default:{
        type: Boolean,
        default: false,
    },
    code:{
        type: String,
        default:"code",
    }
},{timestamps: true});

export const payment_methods = mongoose.model("payment_methods", payment_methodsSchema)