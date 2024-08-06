import { Schema, Document, Model } from 'mongoose';

export  interface  PackageBookingTpes {
  packageId: Schema.Types.ObjectId;
  packageType?: 'offline' | 'online';
  paraExpertId: Schema.Types.ObjectId; 
  userId: Schema.Types.ObjectId;
  bookingDate: Date;
  status: 'pending' | 'confirmed' | 'cancelled' | 'rescheduled' | 'completed';
  location: string;
  address?:string;
  prescriptionReport?: string; 
  questions?: string[];
}


export interface PackageBookingDocument extends PackageBookingTpes, Document {}

export interface PackageBookingModle extends Model<PackageBookingDocument> {}