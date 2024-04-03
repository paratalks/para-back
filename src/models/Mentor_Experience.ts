import mongoose, {Schema, mongo} from "mongoose";

const MentorExperienceSchema = new mongoose.Schema({
    id:{
        type:Number,
        unique:true,
        required:true,
    },
    mentor_id:{
        type:Schema.Types.ObjectId,
        ref:"Mentor",
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

const Mentor_experience = mongoose.model("Mentor_experince", MentorExperienceSchema)

export default Mentor_experience;