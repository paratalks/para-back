import mongoose from "mongoose";

const {Schema} = mongoose;

const Currency_codesSchema = new Schema({
    id:{
        type:Number,
        unique:true,
        required:true
    },
    code:{
        type:String,
        default: null,
    },
    name:{
        type:String,
        default: null,
    },
    symbol:{
        type:String,
        deafult:null
    }
})

const Currency_codes = mongoose.model("Currency_codes", Currency_codesSchema)

export default Currency_codes;
