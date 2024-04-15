import { model } from "mongoose";
import { IAppointment_TypesDocument } from "./Appointment_Types.types";
import Appointment_TypesSchema from "./Appointment_Types.schema";

export const Appointment_Types = model<IAppointment_TypesDocument>(
  "appointment_types",
  Appointment_TypesSchema
);
