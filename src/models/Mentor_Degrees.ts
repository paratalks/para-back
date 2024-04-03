import mongoose from "mongoose";

const MentorDegreesSchema = new mongoose.Schema({
    id:{
        type:Number,
        unique:true,
        required:true
    },
    name:{
        type:String,
        default: null,
    }
},{timestamps: true});

const Mentor_degrees = mongoose.model("Mentor_degrees",MentorDegreesSchema)

export default Mentor_degrees;
