import { model } from "mongoose";
import { appointmentsDocument } from "./appointments.types";
import appointmentsSchema from "./appointments.schema";

export const Appointments = model<appointmentsDocument>(
  "Appointments",
  appointmentsSchema
);
