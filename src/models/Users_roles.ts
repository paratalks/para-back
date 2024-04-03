import mongoose, {Schema} from "mongoose";

const users_rolesSchema = new Schema({
    id:{
        type: Number,
        unique:true,
        required: [true, "Id is required"],
    },
    user_id:{
        type: Schema.Types.ObjectId,
        ref: "Users",
    },
    role_id:{
        type: Schema.Types.ObjectId,
        ref: "Roles",
    },
},{timestamps:true})

export const Users_roles = mongoose.model("Users_roles", users_rolesSchema)