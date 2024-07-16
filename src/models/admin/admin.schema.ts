import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Status,Role } from "../../util/index";
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const adminUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      default:'https://paratalks-private.s3.ap-south-1.amazonaws.com/uploads/user-profile/1720520974125-793bb0d8845f9a44f922b1903fb94c58.jpg'
    },
    phone: {
      type: String,
      required: true,
      match: [
        /^([+][9][1]){0,1}([6-9]{1})([0-9]{9})$/,
        "Please provide valid phone number",
      ],
    },
    refreshToken: {
      type: String,
      required: false,
    },
    fcmToken: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      default: 'active',
      required: false,
    },
    role: {
      type: String,
      default: 'admin',
      required: false,
      },
  },
  { timestamps: true }
);

adminUserSchema.methods.getJwtToken = function () {
  const tokenMap: any = { userId: this._id, email: this.email };

  return jwt.sign(tokenMap, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRY,
  });
};

adminUserSchema.methods.isValidatedPassword = async function (
  usersendPassword: string,
  password: string
) {
  return await bcrypt.compare(usersendPassword, password);
};

adminUserSchema.methods.getForgotPasswordToken = function () {
  // generate a long and random string
  const forgotToken = crypto.randomBytes(20).toString('hex');

  this.forgotPasswordToken = crypto
    .createHash('sha256')
    .update(forgotToken)
    .digest('hex');

  this.forgotPasswordExpiry = Date.now() + 60 * 60 * 1000;

  return forgotToken;
};

export default adminUserSchema;
