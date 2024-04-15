import { Document, Model } from "mongoose";

export interface IAppointment_Types {
  id: Number;
  name: String;
  is_schedule_required: Boolean;
}

export interface IAppointment_TypesDocument extends IAppointment_Types,Document {};

export interface IAppontment_TypesModel extends Model<IAppointment_Types> {};
