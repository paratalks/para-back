import mongoose, { Schema } from "mongoose";

export const paymentSchema = new Schema({
	razorpay_order_id: {
		type: String,
		required: true,
	},
	razorpay_payment_id: {
		type: String,
		required: true,
	},
    razorpay_signature:{
        type:String,
        required: true
    }
}, {timestamps: true});

export default paymentSchema;
