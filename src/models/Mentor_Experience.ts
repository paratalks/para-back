import mongoose, {Schema, mongo} from "mongoose";

const MentorExperienceSchema = new mongoose.Schema({
    id:{
        type:Number,
        required:true,
    },
    mentor_id:{
        type:Schema.Types.ObjectId,
        default:null
    },
    company:{
        type:String,
        default:null,
    },
    from:{
        type:String,
        default: null,
    },
    to:{
        type:String,
        default: null,
    },
    image_path:{
        type:String,
        default:null,
    }
},{timestamps: true});

const MentorExperience = mongoose.model("mentor_experince", MentorExperienceSchema)

export default MentorExperience;