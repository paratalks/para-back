import type { Document, Model, ObjectId } from "mongoose";

export interface appointmentsTypes {
  userId: ObjectId;
  paraExpertId: ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  status: string;
}

export interface appointmentsDocument
  extends appointmentsTypes,
    Document {}

export interface appointmentsModel extends Model<appointmentsDocument> {}
