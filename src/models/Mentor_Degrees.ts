import mongoose from "mongoose";

const MentorDegreesSchema = new mongoose.Schema({
    id:{
        type:Number,
        required:true
    },
    name:{
        type:String,
        default: null,
    }
},{timestamps: true});

const MentorDegrees = mongoose.model("mentor_degrees",MentorDegreesSchema)

export default MentorDegrees;
