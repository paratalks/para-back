import mongoose , {Schema} from "mongoose";

const personal_access_tokensSchema = new Schema({
    id:{
        type: Number,
        unique: true,
        required: [true, "Id is required"],
    },
    tokenable_type:{
        type: String,
    },
    tokenable_id:{
        type: Number,  //refer?
    },
    name:{
        type: String,
    },
    token:{
        type: String,
    },
    abilities:{
        type: String,
        default:null,
    },
    last_used_at:{
        type: Date,
        default: null,
    },
},{timestamps: true});

export const Personal_access_tokens = mongoose.model("Personal_access_tokens", personal_access_tokensSchema)