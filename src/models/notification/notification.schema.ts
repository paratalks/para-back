import mongoose , {Mongoose, Schema} from "mongoose";
mongoose.set('strictQuery', false);

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
    image:{
        type:String,
        required:false,
        default:"https://paratalks-private.s3.ap-south-1.amazonaws.com/uploads/user-profile/1722322860136-1000015258.png"
    }
},{timestamps: true})

export default notificationSchema;

