import mongoose, {Schema} from "mongoose";

const oauth_personal_access_clientsSchema = new Schema({
    id:{
        type: Number,
        unique: true,
        required: [true, "Id is required"],
    },
    client_id:{
        type: Schema.Types.ObjectId,
        ref:"Oauth_clients",       //which client to refer
    },
}, {timestamps: true});

export const Oauth_personal_access_clients = mongoose.model("Oauth_personal_access_clients", oauth_personal_access_clientsSchema)