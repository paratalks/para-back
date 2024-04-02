import mongoose from "mongoose";

const {Schema} = mongoose;

const CurrencyCodesSchema = new Schema({
    id:{
        type:Number,
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

const CurrencyCodes = mongoose.model("currency_codes", CurrencyCodesSchema)

export default CurrencyCodes;
