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
        slots:{
          chat: {
            type: [String],
            required: false,
        },
        video_call: {
            type: [String],
            required: false,
        },
        audio_call: {
            type: [String],
            required: false,
        },
        _id: false,
        },
        _id:false,
      },
    ],
    packages: [{
      title:{
        type:String,
      },
      priority:{
        type:String,
        enum:["high","medium","low"],
        required:false,
        default:'medium'
      },
      type:{
        type:String,
        enum:["online","offline"],
      },
      description:{
        type:String,
      },
      minamount:{
        type:Number,
      },
      maxamount:{
        type:Number,
      },
      additional: {
        type: String,
      },
      packageDuration: {
        type: String,
      },
      services: {
        type: [String],
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
    experience:{
      type:Number,
    },
    consultancy:{
      audio_call_price:{
        type:Number,
      },
      video_call_price:{
        type:Number,
      },
      messaging_price:{
        type:Number,
      },
    },
    socials:{
      instagram:{
        type:String,
      },
      twitter:{
        type:String,
      },
      linkedIn:{
        type:String,
      },
    },
  },
  { timestamps: true }
);

export default paraExpertSchema;
