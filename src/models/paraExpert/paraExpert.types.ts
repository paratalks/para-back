import type { Document, Model, Schema } from "mongoose";

export interface paraExpertTypes {
  userId: Schema.Types.ObjectId;
  expertise: [String];
  availability: [
    { day: number; slots: [String] }
  ];
  package: [{
    title: {
      type: String;
    };
    type: {
      type: String;
      enum: ["online", "offline"];
    };
    amount: {
      type: Number;
    };
  }];
  profilePicture: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface paraExpertDocument extends paraExpertTypes, Document {}

export interface paraExpertModel extends Model<paraExpertDocument> {}
