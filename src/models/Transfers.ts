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
        type: Number,    //ref
    },
    to_type:{
        type: String,
    },
    to_id:{              //ref
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
    deposit_id:{              //ref
        type: Number,
    },
    withdraw_id:{
        type: Number,          //ref
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
        type: String,              //ref
    },
},{timestamps: true});

export const Transfers = mongoose.model("Transfers", transferSchema)