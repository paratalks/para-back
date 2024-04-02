import mongoose, {Schema} from "mongoose";

const roles_permissionsSchema = new Schema({
    id:{
        type: Number,
        unique: true,
        required: [true, "Id is required"],
    },
    role_id:{
        type: Schema.Types.ObjectId,
        ref: "roles",
    },
    permission_id:{
        type: Schema.Types.ObjectId,
        ref: "permissions",
    },
})

export const roles_permissions = mongoose.model("roles_permissions", roles_permissionsSchema)