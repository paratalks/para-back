import mongoose, { Schema } from "mongoose";

const users_permissionsSchema = new Schema({
    user_id:{
        type: Schema.Types.ObjectId,
        ref: "users",
    },
    permission_id:{
        type: Schema.Types.ObjectId,
        ref: "permissions",
    },
})

export const users_permissions = mongoose.model("users_permissions", users_permissionsSchema)