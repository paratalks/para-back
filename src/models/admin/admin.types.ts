import { Document, Model } from "mongoose";
import { Status,Role } from "../../util/index";

export interface adminTypes {
  name: String;
  email:String;
  password: String;
  profilePicture:String;
  phone: String;
  status: String;  
  role: String;   
  refreshToken: String;
  fcmToken: String;
};

export interface adminUserSchemaDocument extends adminTypes , Document {}

export interface adminSchemaModel extends Model<adminTypes> {}