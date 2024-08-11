import { model } from "mongoose";
import { accountSchemaDocument } from "./account.types";
import accountSchema from "./account.schema";

export const Account = model<accountSchemaDocument>("ExpertAccount", accountSchema)