import { Document, Model } from "mongoose";
import { Status } from "../../util/index";

export interface userTypes {
  name: String;
  dateOfBirth: Date;
  email:String;
  gender: String;
  interests: [String];
  profilePicture:String;
  phone: String;
  status: Status;
  refreshToken: String;
  fcmToken: String;
};

export interface userSchemaDocument extends userTypes , Document {}

export interface userSchemaModel extends Model<userTypes> {}