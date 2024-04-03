import mongoose, { Schema } from "mongoose";

const oauth_auth_codesSchema = new Schema({
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
        type: Schema.Types.ObjectId,
        ref:"Oauth_clients",     //which client to refer
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
})

export const Oauth_auth_codes = mongoose.model("Oauth_auth_codes", oauth_auth_codesSchema)