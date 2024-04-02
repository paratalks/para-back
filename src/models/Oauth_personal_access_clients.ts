import mongoose, {Schema} from "mongoose";

const oauth_personal_access_clientsSchema = new Schema({
    id:{
        type: Number,
        unique: true,
        required: [true, "Id is required"],
    },
    client_id:{
        type: String,
    },
}, {timestamps: true});

export const oauth_personal_access_clients = mongoose.model("oauth_personal_access_clients", oauth_personal_access_clientsSchema)