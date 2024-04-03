import mongoose from "mongoose";

const MentorBanksSchema = new mongoose.Schema({
    id:{
        type:Number,
        required:true
    },
    name:{
        type:String,
        default: null,
    }
},{timestamps: true});

const MentorBanks = mongoose.model("mentor_banks",MentorBanksSchema)

export default MentorBanks;
