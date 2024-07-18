import { Schema, Document, Model } from 'mongoose';

export  interface  PackageBookingTypes {
  packageId: Schema.Types.ObjectId;
  paraExpertId: Schema.Types.ObjectId; 
  userId: Schema.Types.ObjectId;
  bookingDate: Date;
  status: 'pending' | 'confirmed' | 'cancelled' | 'rescheduled' | 'scheduled';
  location: string;
  prescriptionReport?: string; 
  questions?: string[];
}


export interface PackageBookingDocument extends PackageBookingTypes, Document {}

export interface PackageBookingModle extends Model<PackageBookingDocument> {}