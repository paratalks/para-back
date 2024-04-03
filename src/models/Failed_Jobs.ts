import mongoose, { mongo } from "mongoose";

const {Schema} = mongoose;

const FailedJobsSchema = new Schema({
    id:{
        type:Number,
        unique:true,
        require: true
    },
    uuid:{
        type:mongoose.Types.ObjectId,
    },
    connection:{
        type:String,
    },
    queue:{
        type:String,
    },
    payload:{
        type:String,
    },
    exception:{
        type:String,
    },
    failedAt:{
        type: Date,
        default: Date.now(),
    }
})

const Failed_jobs = mongoose.model("Failed_jobs", FailedJobsSchema)

export default Failed_jobs;