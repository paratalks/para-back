import mongoose, { Schema } from "mongoose";

const transactionsSchema = new Schema({
    id:{
        type: Number,
        unique: true,
        required: [true, "Id is required"],
    },
    payable_type:{
        type: String,
    },
    payable_id:{           //refer?
        type: Number,
    },
    wallet_id:{            //refer?
        type: Number,
    },
    type:{
        type: String,
        enum:["deposit","withdraw"],
    },
    amount:{
        type: Number,
    },
    confirmed:{
        type: Boolean,
        default: false,
    },
    meta:{
        type: Object,  //check the type
        default: null,
    },
    uuid:{
        type: String,       //refer?
    },
    
},{timestamps:true})

export const Transactions = mongoose.model("Transactions", transactionsSchema)