import mongoose, {Schema} from "mongoose";

const oauth_clientsSchema = new Schema({
    id:{
        type: Number,
        unique: true,
        required: [true, "Id is required"],
    },
    user_id:{
        type: Schema.Types.ObjectId,
        ref: "users",
        default:null,
    },
    name:{
        type: String,
        required: [true, "Name is required"],
    },
    secret:{
        type: String,
        default:null,
    },
    provider:{
        type: String,
        default:null,
    },
    redirect:{
        type: String,
    },
    personal_access_client:{
        type:Boolean,
    },
    password_client:{
        type:Boolean,
    },
    revoked:{
        type:Boolean,
    },

},{timestamps: true});

export const oauth_clients = mongoose.model("oauth_clients", oauth_clientsSchema)