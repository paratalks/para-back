import mongoose, { mongo } from "mongoose";

const {Schema} = mongoose;

const FailedJobsSchema = new Schema({
    id:{
        type:Number,
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

const FailedJobs = mongoose.model("failed_jobs", FailedJobsSchema)

export default FailedJobs;