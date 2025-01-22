import { model } from "mongoose";
import { adminUserSchemaDocument } from "./admin.types";
import adminUserSchema from "./admin.schema";

export const Admin = model<adminUserSchemaDocument>("Admin", adminUserSchema)