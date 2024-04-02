import mongoose, { Schema } from "mongoose";

const usersSchema = new Schema({

    id: {
        type: Number,
        unique: true,
    },
    first_name: {
        type: String,
        default: null,
    },
    last_name: {
        type: String,
        default: null,
    },
    email: {
        type: String,
        default: null,
    },
    about:{
        type: String,
        default: null,
    },
    password: {
        type: String,
        default: null,
    },
    phone:{
        type: String,
        default: null,
    },
    image_path:{
        type: String,
        default: null,
    },
    country:{
        type: Number,
        default: null,
    },
    city:{
        type: String,
        default: null,
    },
    address:{
        type: String,
        default: null,
    },
    postal_code:{
        type: String,
        default: null,
    },
    is_otp_verified:{
        type: String,  //should be boolean
        default: null,
    },
    remember_token:{
        type: String,
        default: null,
    },
    father_name:{
        type: String,
        default: null,
    },
    cnic:{
        type: String,
        default: null,
    },
    gender:{
        type: String,  //should be enum
        default: null,
    },
    religion:{
        type: String,
        default: null,
    },
    dob:{
        type: Date,
        default: null,
    },
    occupation:{
        type: Number,
        default: null,
    },
    online_status:{
        type: String,
        default: "offline",
    },
    admin_user:{
        type: Boolean,
        default: false,
    },
    fb_id:{
        type: String,
        default: null,
    },
    google_id:{
        type: String,
        default: null,
    },
    
},{timestamps:true})

export const users = mongoose.model("users", usersSchema)