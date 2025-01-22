import { model } from "mongoose";
import uploadSchema from "./upload.schema";
import { userSchemaDocument } from "../user/user.types";

export const Upload = model<userSchemaDocument>("Upload", uploadSchema);
