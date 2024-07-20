import { Schema, Document, Model } from 'mongoose';

export  interface  PackageBookingTpes {
  packageId: Schema.Types.ObjectId;
  paraExpertId: Schema.Types.ObjectId; 
  userId: Schema.Types.ObjectId;
  bookingDate: Date;
  status: 'pending' | 'confirmed' | 'cancelled' | 'rescheduled' | 'scheduled';
  location: string;
  address?:string;
  prescriptionReport?: string; 
  questions?: string[];
}


export interface PackageBookingDocument extends PackageBookingTpes, Document {}

export interface PackageBookingModle extends Model<PackageBookingDocument> {}