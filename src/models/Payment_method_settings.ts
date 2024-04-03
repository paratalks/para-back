import mongoose, {Schema} from "mongoose";

const payment_method_settingsSchema = new Schema({

    id: {
        type: Number,
        unique: true,
        required: [true, "Id is required"],
    },
    name: {
        type: String,        
        required: [true, "name is required"],
    },
    display_name:{
        type: String,
        default:null,
    },
    value: {
        type: String,
    },
    payment_method_id:{
        type: Schema.Types.ObjectId, 
        ref: "Payment_methods",
    },
}, {timestamps: true});

export const Payment_method_settings = mongoose.model("Payment_method_settings", payment_method_settingsSchema)