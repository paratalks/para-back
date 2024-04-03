import mongoose, { Schema } from "mongoose";

const mentor_holiday_dateSchema = new Schema({
    id:{
        type: Number,
        unique: true,
        required: [true, "Id is required"],
    },
    mentor_id:{
        type: Schema.Types.ObjectId,
        ref: "Mentor",
    },
    date:{
        type: Date,
    },
    is_holiday:{
        type: Boolean,
        default: false,
    },
    comment:{
        type: String,
    }
})

export const Mentor_holiday_date = mongoose.model("Mentor_holiday_date", mentor_holiday_dateSchema)