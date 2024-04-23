import { Document, Model } from "mongoose";

export interface userTypes {
    name:String,
    dateOfBirth:Date,
    gender: String,
    interests: [String],
    phone:String,
};

export interface userSchemaDocument extends userTypes , Document {}

export interface userSchemaModel extends Model<userTypes> {}