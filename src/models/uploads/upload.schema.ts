import mongoose, { Schema } from "mongoose";

export const uploadSchema = new Schema(
  {
    videoLinks: {
      type: String, 
      required: true, 
    },
    createdAt: {
      type: Date,
      default: Date.now, 
    },
    updatedAt: {
      type: Date,
      default: Date.now, 
    },
    title:{
      type:String,
      required:true
      
    },
    description:{
      type:String,
      required:true
    }
  },
  {
    timestamps: true, 
  }

  


);

export default uploadSchema;
