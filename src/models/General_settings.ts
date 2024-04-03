import mongoose, { mongo } from "mongoose";

const {Schema} = mongoose;

const GeneralSettingsSchema = new Schema({
    id:{
        type:Number,
        unique:true,
        required:true,
    },
    logo:{
        type:String,
    },
    title:{
        type:String,
    },
    tagline:{
        type:String,
    },
    seo_Des:{
        type:String,
    },
    seo_keywords:{
        type:String,
    },
    facebook_link:{
        type:String,
    },
    twitter_link:{
        type:String,
    },
    linkedin_link:{
        type:String,
    },
    address:{
        type:String,
    },
    phone:{
        type:String,
    },
    company_email:{
       type: String
    },
    currency_symbol:{
        type:String,
        default: "$",
    },
    about_company:{
        type:String,
    },
})

const General_settings = mongoose.model("General_settings", GeneralSettingsSchema)

export default General_settings;