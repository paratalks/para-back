import mongoose, {Schema} from "mongoose";

const migrationsSchema = new Schema({
    id:{
        type: Number,
        unique: true,
        required: [true, "Id is required"],
    },
    migration:{
        type: String,
    },
    batch:{
        type: Number,
    },
})

export const migrations = mongoose.model("migrations", migrationsSchema)