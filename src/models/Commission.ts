import mongoose, { mongo } from "mongoose";

const {Schema} = mongoose;

const CommissionSchema = new Schema({
    id:{
        type: Number,
        unique:true,
    },
    fixed:{
        type:Number, //doubt tiny int(3)
    },
    amount:{
        type:Number,
    }
})

const Commission = mongoose.model("Commission", CommissionSchema)

export default Commission; 