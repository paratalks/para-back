import type { Document, Model, ObjectId, Schema } from "mongoose";

export interface reviewTypes {
  paraExpertId: ObjectId;
  userId: ObjectId;
  review: String;
  rating: Number;
}

export interface reviewDocument extends reviewTypes, Document {}

export interface reviewModel extends Model<reviewDocument> {}
