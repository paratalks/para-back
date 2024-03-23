import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
const expression = { isActive: { $eq: true } };

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "Please provide a firstName"],
        maxlength: [40, "Name should be under 40 characters."],
        trim: true,
    },
    lastName: {
        type: String,
        required: [true, "Please provide a lastName"],
        maxlength: [40, "Name should be under 40 characters."],
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Please provide email"],
        index: {
            unique: true,
            partialFilterExpression: expression,
        },
        match: [
            /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/,
            "Please provide valid email",
        ],
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
        minlength: [6, "Password should be of atleast 6 characters."],
        // select:false  // so that password will not go with model , we don't have to do user.password=undefined
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
    passwordChangedAt: {
        type: Date,
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        // required:true,
        default: "user",
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    gender: {
        type: String,
        // required: [true, "Please provide gender"],
        enum: {
            values: ["Male", "Female", "Others"],
            message: "Please choose from Male, Female or Others",
        },
    },
    phoneNumber: {
        type: String,
        // required: [true, "Please provide phone number"],
        trim: true,
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        // required: true,
        ref: "User",
    },
    modifiedBy: {
        type: mongoose.Types.ObjectId,
        // required: true,
        ref: "User",
    },
});

// encrypt password before save
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
});

// validate the password with passed on user password
userSchema.methods.isValidatedPassword = async function (userSendPassword: string, password: string) {
    return await bcrypt.compare(userSendPassword, password);
};

// create and return jwt token
userSchema.methods.getJwtToken = function () {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const tokenMap: any = { userId: this._id, role: this.role};
    console.log(tokenMap);
    
    return jwt.sign(tokenMap, process.env.JWT_SECRET!, {
        expiresIn: process.env.JWT_EXPIRY,
    });
};

// generate forget password token (string)
userSchema.methods.getForgotPasswordToken = function () {
    // generate a long and random string
    const forgotToken = crypto.randomBytes(20).toString("hex");

    // getting a hash - make sure to get a hash on backend
    this.forgotPasswordToken = crypto.createHash("sha256").update(forgotToken).digest("hex");

    // time of token
    this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000; // 20 mins to expire password reset token

    return forgotToken;
};

const User = mongoose.model("User", userSchema, "user");

export default User;