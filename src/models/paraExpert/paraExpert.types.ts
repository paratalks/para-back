import { Document, Model, Schema, Types } from "mongoose";

export interface paraExpertTypes {
  userId: Types.ObjectId;
  expertise: string[];
  availability: { day: string; slots: string[] }[];
  pricing: number;
  profilePicture: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface paraExpertDocument extends paraExpertTypes, Document {}

export interface paraExpertModel extends Model<paraExpertDocument> {}
