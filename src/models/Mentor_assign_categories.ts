import mongoose, { Schema } from "mongoose";

const MentorAssignCategoriesSchema = new mongoose.Schema({
    id:{
        type:Number,
        unique:true,
        required:true
    },
    mentor_id:{
        type:Schema.Types.ObjectId,
        ref:"Mentor",
        default: null
    },
    category_id:{
        type:Schema.Types.ObjectId,
        ref:"Mentor_category",
    },
})

const Mentor_assign_categories = mongoose.model("Mentor_assign_categories", MentorAssignCategoriesSchema)

export default Mentor_assign_categories;