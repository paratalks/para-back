import mongoose , {Mongoose, Schema} from "mongoose";

const notificationSchema =new Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    title:{
        type: String
    },
    description:{
        type:String,
    },
    referrer:{
        type:String,
    },
    referrerId:{
        type: mongoose.Schema.Types.ObjectId
    },
},{timestamps: true})

export default notificationSchema;

