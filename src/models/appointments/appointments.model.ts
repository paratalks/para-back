import { model } from "mongoose";
import type { appointmentsDocument } from "./appointments.types";
import appointmentsSchema from "./appointments.schema";

export const Appointments = model<appointmentsDocument>(
  "appointments",
  appointmentsSchema
);
