import mongoose , {Mongoose, Schema} from "mongoose";

const notificationSchema =new Schema({
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

