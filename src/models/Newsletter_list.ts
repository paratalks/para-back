import mongoose,{Schema} from "mongoose";

const newsletter_listSchema = new Schema({
    id:{
        type: Number,
        unique: true,
        required: [true, "Id is required"],
    },
    email:{
        type: String,
        unique: true,
        required: [true, "Email is required"],
    },
    is_subscriber:{
        type: Boolean,
        default: true,
    }
},{timestamps: true});

export const newsletter_list = mongoose.model("newsletter_list", newsletter_listSchema)