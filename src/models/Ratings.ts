import mongoose, {Schema} from "mongoose";

const ratingsSchema = new Schema({
    id:{
        type: Number,
        unique: true,
        required: [true, "Id is required"],
    },
    mentee_id:{
        type: Schema.Types.ObjectId,
        ref: "Mentee",
    },
    mentor_id:{
        type: Schema.Types.ObjectId,
        ref: "Mentor",
    },
    appointment_id:{
        type: Schema.Types.ObjectId,
        ref: "Appointment_types",
    },
    rating:{
        type:Number,
    },
    comments:{
        type:String,
        default: null,
    },
},{timestamps: true});

export const Ratings = mongoose.model("Ratings", ratingsSchema)