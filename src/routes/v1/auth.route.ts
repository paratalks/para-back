import express from "express";
import { signup, logout,handleMobileVerificationAndOTP, refreshToken, verifyOTP, sendOTP, paraSignup } from "../../controllers/auth.controller";
import { adminLogin, adminSignup} from "../../controllers/admin.controller"
import { verifyApiKey, verifyJWT } from "../../middlewares/auth.middleware";

const router = express.Router();

router.route("/refresh-token").get(refreshToken);
router.route("/signup").post(verifyJWT,signup);
router.route("/paraexpert/signup").post(verifyJWT,paraSignup);
router.route('/paraexpert/send-otp').post(verifyApiKey,handleMobileVerificationAndOTP);
router.route("/logout").get(logout);
router.route("/send-otp").post(verifyApiKey,sendOTP);
router.route("/verify-otp").post(verifyApiKey,verifyOTP);
router.route("/admin/signup").post(verifyApiKey,adminSignup);
router.route("/admin/login").post(verifyApiKey,adminLogin);

export default router;
