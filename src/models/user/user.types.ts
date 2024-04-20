import { Document, Model } from "mongoose";

export interface userTypes {
    name:String,
    gender: String,
    interest: [String]
};

export interface userSchemaDocument extends userTypes , Document {}

export interface userSchemaModel extends Model<userTypes> {}