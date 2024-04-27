import { Document, Model, Schema} from "mongoose";

export interface paraExpertTypes {
  userId: Schema.Types.ObjectId;
  expertise: [String];
  //availability: { day: string; slots:[{startTime: string; endTime: string; booked: boolean}] }[];
  availability: [{ day: String, slots:[String]}]
  pricing: number;
  profilePicture: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface paraExpertDocument extends paraExpertTypes, Document {}

export interface paraExpertModel extends Model<paraExpertDocument> {}
