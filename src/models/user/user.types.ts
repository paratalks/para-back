import { Document, Model } from "mongoose";

export interface userTypes {
  name: String;
  dateOfBirth: Date;
  gender: String;
  interests: [String];
  profilePicture: string;
  phone: String;
  refreshToken: String;
  fcmToken: String;
};

export interface userSchemaDocument extends userTypes , Document {}

export interface userSchemaModel extends Model<userTypes> {}