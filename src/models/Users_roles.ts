import mongoose, {Schema} from "mongoose";

const users_rolesSchema = new Schema({
    id: {
        type: Number,
        unique: true,
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: "users",
        default: null,
    },
    role_id: {
        type: Schema.Types.ObjectId,
        ref: "roles",
        default: null,
    },
}, {timestamps: true});

export const users_roles = mongoose.model("users_roles", users_rolesSchema)