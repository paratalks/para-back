import type { Document,Model,Schema } from "mongoose";

export interface paymentTypes {
    razorpay_order_id: String,
    razorpay_payment_id: String,
    razorpay_signature: String
}

export interface paymentDocument extends paymentTypes, Document {}

export interface paymentModel extends Model<paymentDocument>  {}