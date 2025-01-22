import { model } from "mongoose";
import type { reviewDocument } from "./review.types";
import reviewSchema from "./review.schema";

export const Review = model<reviewDocument>("Review", reviewSchema);
