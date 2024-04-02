import mongoose, { Schema } from "mongoose";

const mentor_holiday_dateSchema = new Schema({
    id:{
        type: Number,
        unique: true,
        required: [true, "Id is required"],
    },
    mentor_id:{
        type: Schema.Types.ObjectId,
        ref: "mentor",
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

export const mentor_holiday_date = mongoose.model("mentor_holiday_date", mentor_holiday_dateSchema)