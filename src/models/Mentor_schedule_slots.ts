import mongoose , { Schema } from "mongoose";

const mentor_schedule_slotsSchema = new Schema({
    id:{
        type: Number,
        unique: true,
        required: [true, "Id is required"],
    },
    schedule_id:{
        type: Schema.Types.ObjectId,
        ref: "Mentor_schedules",
    },
    start_time:{           //types
        type: Date,
    },
    end_timme:{       //types
        type: Date,
    },
    slot_duration:{  //types
        type: Date,
    },
    is_active:{
        type: Boolean,
        default: false,
    },
    shift_id:{
        type: Number,
    }
})

export const Mentor_schedule_slots = mongoose.model("Mentor_schedule_slots", mentor_schedule_slotsSchema)