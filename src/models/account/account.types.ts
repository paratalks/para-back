import { Document, Model, Schema } from "mongoose";

export interface accountTypes {
  paraExpertId: Schema.Types.ObjectId,
  accountHolderName: String;
  accountNumber: Number;
  bankName: String;
  ifscCode: String;
  branchName?: String;
  status?: 'active' | 'inactive';
};

export interface accountSchemaDocument extends accountTypes , Document {}

export interface accountSchemaModel extends Model<accountTypes> {}