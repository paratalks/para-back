import type { Document, Model, ObjectId, Schema } from "mongoose";

export interface uploadTypes {
  videoLinks:String,
  createdAt:String,
  updatedAt:String,
  title:String,
  description:String
}

export interface uploadSchemaDocument extends uploadTypes, Document {}

export interface uploadSchemaModel extends Model<uploadTypes> {}
