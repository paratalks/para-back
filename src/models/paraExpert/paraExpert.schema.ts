import mongoose, { Schema } from "mongoose";
import { title } from "node:process";

const paraExpertSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    expertise: {
      type: [String],
    },
    availability: [
      {
        day: {
          type: Number,
          enum:[0,1,2,3,4,5,6],
        },
        slots:[String],
        _id:false,
      },
    ],
    packages: [{
      title:{
        type:String,
      },
      type:{
        type:String,
        enum:["online","offline"],
      },
      description:{
        type:String,
      },
      amount:{
        type:Number,
      },
    }],
    ratings:{
      type:Number,
    },
    bio:{
      type:String,
    },
    basedOn:{
      type:String,
    },
    qualifications:[{
      title:{
        type:String,
      },
      certificateUrls:{
        type:[String],
      }
    }],
    reviews:{
      type:[String],
    },
    experience:{
      type:Number,
    },
  },
  { timestamps: true }
);

export default paraExpertSchema;
