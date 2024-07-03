import type { Document, Model, Schema } from "mongoose";
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
export interface paraExpertTypes {
  userId: Schema.Types.ObjectId;
  expertise: [String];
  availability: IAvailability[];
  packages: [
    {
      title: string;
      type: {
        type: String;
        enum: ["online", "offline"];
      };
      description: String;
      amount: Number;
    }
  ];
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
    instagram:String;
    twitter:String;
    linkenIn:String;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface paraExpertDocument extends paraExpertTypes, Document {}

export interface paraExpertModel extends Model<paraExpertDocument> {}
