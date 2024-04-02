import mongoose, {Schema} from "mongoose";

const oauth_refresh_tokensSchema = new Schema({
    id:{
        type: Number,
        unique: true,
        required: [true, "Id is required"],
    },
    access_token_id:{
        type: Schema.Types.ObjectId,
        ref: "oauth_access_tokens",  //check ref
    },
    revoked:{
        type: Boolean,
        default: false,
    },
    expires_at:{
        type: Date,
        default: null,
    },
},{timestamps: true});

export const oauth_refresh_tokens = mongoose.model("oauth_refresh_tokens", oauth_refresh_tokensSchema)