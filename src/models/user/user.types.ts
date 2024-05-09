import { Document, Model } from "mongoose";

export interface userTypes {
    name:String,
    dateOfBirth:Date,
    gender: String,
    interests: [String],
    phone:String,
    refreshToken:String,
    fcm:{
        notification:{
            title:String,
            body:String,
        },
        data:String,
    },
};

export interface userSchemaDocument extends userTypes , Document {}

export interface userSchemaModel extends Model<userTypes> {}