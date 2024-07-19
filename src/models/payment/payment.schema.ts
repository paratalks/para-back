import mongoose, { Schema } from "mongoose";

export const paymentSchema = new Schema({
  GatewayDetails: {
    order_id: {
      type: String,
      required: true,
    },
    payment_id: {
      type: String,
      required: true,
    },
    signature: {
      type: String,
      required: true,
    },
  },
  amount: {
    type: Number,
    required: true,
  },
  bookingId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'PackageBooking',
  },
  bookingMethod: {
	type: String,
	required: true,
	enum: ['appointment', 'package'],
	default:'appointment'
  },
  paymentReceiptUrl: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  }
}, { timestamps: true });

export default paymentSchema;
