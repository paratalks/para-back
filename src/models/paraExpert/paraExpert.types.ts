import type { Document, Model, Schema } from "mongoose";
import mongoose from "mongoose";
export interface IConsultancy {
  audio_call_price: number;
  video_call_price: number;
  messaging_price: number;
}

export interface ISlots {
  chat: string[];
  video_call: string[];
  audio_call: string[];
}

export interface IAvailability {
  day: number;
  slots: ISlots;
}
export interface IPackage {
  _id?: string;
  title: string;
  priority?: 'high' | 'medium' | 'low';
  type: 'online' | 'offline';
  description: string;
  minamount: number;
  maxamount: number;
  services: string[];
  additional?: string;
  packageDuration?: string;
}

export interface paraExpertTypes {
  userId: Schema.Types.ObjectId;
  expertise: [String];
  availability: IAvailability[];
  packages:IPackage[]
  ratings: Number;
  bio: String;
  basedOn: String;
  qualifications: [
    {
      title: String;
      certificateUrls: [String];
    }
  ];
  experience: Number;
  consultancy: IConsultancy;

  socials:{
    instagram?:String;
    twitter?:String;
    linkenIn?:String;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface paraExpertDocument extends paraExpertTypes, Document {}

export interface paraExpertModel extends Model<paraExpertDocument> {}
