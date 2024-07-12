import express from "express";
import { signup, logout,handleMobileVerificationAndOTP, refreshToken, verifyOTP, sendOTP, paraSignup } from "../../controllers/auth.controller";
import { verifyJWT } from "../../middlewares/auth.middleware";

const router = express.Router();

router.route("/refresh-token").get(refreshToken);
router.route("/signup").post(verifyJWT,signup);
router.route("/paraexpert/signup").post(verifyJWT,paraSignup);
router.route('/paraexpert/send-otp').post(handleMobileVerificationAndOTP);
router.route("/logout").get(logout);
router.route("/send-otp").post(sendOTP);
router.route("/verify-otp").post(verifyOTP);

export default router;
