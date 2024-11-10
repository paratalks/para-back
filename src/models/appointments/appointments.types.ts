import type { Document, Model, ObjectId } from "mongoose";

export interface appointmentsTypes {
  userId: ObjectId;
  paraExpertId: ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  status: string;
  appointmentMode: {
    type: string;
    enum: ["online", "offline"];
  };
  appointmentMethod: {
    type: string;
    enum: ["chat", "video_call", "audio_call", "offline_package"];
  };
  callToken: {
    type: String;
  };
  problem:string[];
  reason:string;
}

export interface appointmentsDocument
  extends appointmentsTypes,
    Document {}

export interface appointmentsModel extends Model<appointmentsDocument> {}
