import mongoose, { Schema } from "mongoose";

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
    package: [{
      title:{
        type:String,
      },
      type:{
        type:String,
        enum:["online","offline"],
      },
      amount:{
        type:Number,
      },
    }],
    profilePicture: {
      type: String,
    },
  },
  { timestamps: true }
);

export default paraExpertSchema;
