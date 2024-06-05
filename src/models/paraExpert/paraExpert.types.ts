import type { Document, Model, Schema } from "mongoose";

export interface paraExpertTypes {
  userId: Schema.Types.ObjectId;
  expertise: [String];
  availability: [{ day: number; slots: [String] }];
  packages: [
    {
      title: string;
      type: {
        type: String;
        enum: ["online", "offline"];
      };
      description:String;
      amount: Number;
    }
  ];
  profilePicture: string;
  ratings: Number;
  bio: String;
  basedOn: String;
  qualifications: [
    {
      title: String;
      certificateUrls: [String];
    }
  ];
  reviews:[string];
  createdAt: Date;
  updatedAt: Date;
}

export interface paraExpertDocument extends paraExpertTypes, Document {}

export interface paraExpertModel extends Model<paraExpertDocument> {}
