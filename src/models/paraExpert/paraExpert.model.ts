import { model } from "mongoose";
import { paraExpertDocument } from "./paraExpert.types";
import paraExpertSchema from "./paraExpert.schema";

export const paraExpert = model<paraExpertDocument>(
  "paraExpert",
  paraExpertSchema
);
