import mongoose, { Schema } from "mongoose";

const MentorAssignCategoriesSchema = new mongoose.Schema({
    id:{
        type:Number,
        required:true
    },
    mentor_id:{
        type:Schema.Types.ObjectId,
        default: null
    },
    category_id:{
        type:Schema.Types.ObjectId
    },
})

const MentorAssignCategories = mongoose.model("mentor_assign_categories", MentorAssignCategoriesSchema)

export default MentorAssignCategories;