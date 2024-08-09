import { model } from "mongoose";
import paymentSchema from "./payment.schema";
import type { PaymentDocument } from "./payment.types";

export const Payment = model<PaymentDocument>("Payment", paymentSchema);
