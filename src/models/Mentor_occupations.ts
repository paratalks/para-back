import mongoose, {Schema} from "mongoose";

const mentor_occupationsSchema = new Schema({
    id:{
        type: Number,
        unique: true,
        required: [true, "Id is required"],
    },
    name:{
        type: String,
        required: [true, "Name is required"],
    }
},{timestamps: true});

export const Mentor_occupations = mongoose.model("Mentor_occupations", mentor_occupationsSchema)