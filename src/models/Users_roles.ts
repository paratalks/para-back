import mongoose, {Schema} from "mongoose";

const users_rolesSchema = new Schema({
    id:{
        type: Number,
        unique:true,
    },
    user_id:{
        type: Schema.Types.ObjectId,
        ref: "users",
    },
    role_id:{
        type: Schema.Types.ObjectId,
        ref: "roles",
    },
},{timestamps:true})

export const users_roles = mongoose.model("users_roles", users_rolesSchema)