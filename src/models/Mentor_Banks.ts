import mongoose from "mongoose";

const MentorBanksSchema = new mongoose.Schema({
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

const Mentor_banks = mongoose.model("Mentor_banks",MentorBanksSchema)

export default Mentor_banks;
