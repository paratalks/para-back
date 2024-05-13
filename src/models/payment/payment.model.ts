import { model } from "mongoose";
import type { paymentDocument } from "./payment.types";
import paymentSchema from "./payment.schema";

export const Payment = model<paymentDocument>("Payment", paymentSchema);
