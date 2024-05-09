import mongoose , {Mongoose, Schema} from "mongoose";

const notificationSchema =new Schema({
    title:{
        type: String
    },
    description:{
        type:String,
    },
    referrer:{
        
    },
    referrerId:{
        type: mongoose.Schema.Types.ObjectId
    },
    image:{
        type:String,
    }
},{timestamps: true})

export default notificationSchema;

