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
    payable_id:{
        type: Number,
    },
    wallet_id:{
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
        type: String,
    },
    
},{timestamps:true})

export const transactions = mongoose.model("transactions", transactionsSchema)