import mongoose, {Schema} from "mongoose";

const mentor_schedulesSchema = new Schema({
    id:{
        type: Number,
        unique: true,
        required: [true, "Id is required"],
    },
    mentor_id:{
        type: Schema.Types.ObjectId,
        ref: "mentors",
    },
    appointment_type_id:{
        type: Schema.Types.ObjectId,
        ref: "appointment_types",
    },
    fee:{
        type: Number,
    },
    day:{
        type: String,
    },
    is_holiday:{
        type: Boolean,
        default: false,
    },
    is_active:{
        type: Boolean,
        default: true,
    },
},{timestamps: true});

export const mentor_schedules = mongoose.model("mentor_schedules", mentor_schedulesSchema)