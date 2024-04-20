import { model } from "mongoose";
import { appointmentsDocuments } from "./appointments.types";
import OTPStoreTypes_Schema from "./appointments.schema";

export const appointments = model<appointmentsDocuments>(
  "appointments",
  appointmentsSchema
);
