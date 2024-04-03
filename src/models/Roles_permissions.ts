import mongoose, {Schema} from "mongoose";

const roles_permissionsSchema = new Schema({
    id:{
        type: Number,
        unique: true,
        required: [true, "Id is required"],
    },
    role_id:{
        type: Schema.Types.ObjectId,
        ref: "Roles",
    },
    permission_id:{
        type: Schema.Types.ObjectId,
        ref: "Permissions",
    },
})

export const Roles_permissions = mongoose.model("Roles_permissions", roles_permissionsSchema)