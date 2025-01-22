import type { Document, Model, Schema } from "mongoose";

export interface GatewayDetails {
  order_id: string;
  payment_id: string;
  signature: string;
}

export interface PaymentTypes {
  GatewayDetails: GatewayDetails;
  amount: number;
  bookingId: Schema.Types.ObjectId;
  paraExpertId: Schema.Types.ObjectId;
  userId:Schema.Types.ObjectId;
  bookingMethod: 'appointment' | 'package';
  paymentReceiptUrl?: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface PaymentDocument extends PaymentTypes, Document {}

export interface PaymentModel extends Model<PaymentDocument> {}