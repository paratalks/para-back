import mongoose, {Schema} from "mongoose";

const transferSchema = new Schema({

    id: {
        type: Number,
        unique: true
    },
    from_type:{
        type: String,
    },
    from_id:{
        type: Number,
    },
    to_type:{
        type: String,
    },
    to_id:{
        type: Number,
    },
    status:{
        enum:["exchange","transfer","paid","refund","gift"],
        default: "transfer",
    },
    status_last:{
        enum:["exchange","transfer","paid","refund","gift"],
        default: null,
    },
    deposit_id:{
        type: Number,
    },
    withdraw_id:{
        type: Number,
    },
    discount:{
        type: Number,
        default:0,
    },
    fee:{
        type: Number,
        default:0,
    },
    uuid:{
        type: String,
    },
},{timestamps: true});

export const transfers = mongoose.model("transfers", transferSchema)