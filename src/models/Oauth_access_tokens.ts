import mongoose, {Schema} from "mongoose";

const Oauth_access_tokensSchema = new Schema({
    id:{
        type: Number,
        unique: true,
        required: [true, "Id is required"],
    },
    user_id:{
        type: Schema.Types.ObjectId,
        ref: "users",
    },
    client_id:{
        type: String,
    },
    name:{
        type: String,
        feault:null,
    },
    scopes:{
        type: String,
        default:null,
    },
    revoked:{
        type: Boolean,
        default: false,
    },
    expires_at:{
        type: Date,
        default: null,
    }
},{timestamps: true});

export const oauth_access_tokens = mongoose.model("oauth_access_tokens", Oauth_access_tokensSchema)