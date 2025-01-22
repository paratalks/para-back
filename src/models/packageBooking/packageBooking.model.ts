import { model } from "mongoose";
import { PackageBookingDocument } from "./packageBooking.types";
import PackageBookingSchema from "./packageBooking.schema";

export const PackagesBooking = model<PackageBookingDocument>(
  "PackageBooking",
  PackageBookingSchema
);
