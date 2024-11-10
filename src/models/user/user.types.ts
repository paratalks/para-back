import { Document, Model } from "mongoose";
import { Status } from "../../util/index";

export interface userTypes {
  name: string;
  dateOfBirth: Date;
  email:string;
  gender: string;
  interests: [String];
  profilePicture:String;
  phone: String;
  status:String;
  refreshToken: String;
  fcmToken: String;
};

export interface userSchemaDocument extends userTypes , Document {}

export interface userSchemaModel extends Model<userTypes> {}