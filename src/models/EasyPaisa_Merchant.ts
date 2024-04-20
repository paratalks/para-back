import mongoose from "mongoose";

const { Schema } = mongoose;

const EasyPaisaMerchantSchema = new Schema({
    id:{
        type:Number,
        required: true
    },
    storeid:{
        type:String,

    },
    hash:{
        type:String,
    }
},{timestamps : true});

const EasyPaisa = mongoose.model("easypaisa_merchant", EasyPaisaMerchantSchema)

export default EasyPaisa;
