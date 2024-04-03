import mongoose, {Schema} from "mongoose";

const users_permissionsSchema = new Schema({
    user_id:{
        type: Schema.Types.ObjectId,
        ref: "Users",
    },
    permission_id:{
        type: Schema.Types.ObjectId,
        ref: "Permissions",
    },
})

export const Users_permissions = mongoose.model("Users_permissions", users_permissionsSchema)