import mongoose from "mongoose";

const { Schema } = mongoose;

const EasyPaisaMerchantSchema = new Schema({
    id:{
        type:Number,
        unique:true,
        required: true
    },
    storeid:{
        type:String,

    },
    hash:{
        type:String,
    }
},{timestamps : true});

const EasyPaisa_merchant = mongoose.model("Easypaisa_merchant", EasyPaisaMerchantSchema)

export default EasyPaisa_merchant;
