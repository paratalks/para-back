import mongoose, {Schema} from "mongoose";

const ratingsSchema = new Schema({
    id:{
        type: Number,
        unique: true,
        required: [true, "Id is required"],
    },
    mentee_id:{
        type: Schema.Types.ObjectId,
        ref: "mentee",
    },
    mentor_id:{
        type: Schema.Types.ObjectId,
        ref: "mentor",
    },
    appointment_id:{
        type: Schema.Types.ObjectId,
        ref: "appointment_types",
    },
    rating:{
        type:Number,
    },
    comments:{
        type:String,
        default: null,
    },
},{timestamps: true});

export const ratings = mongoose.model("ratings", ratingsSchema)