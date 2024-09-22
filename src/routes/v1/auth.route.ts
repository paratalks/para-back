import express from "express";
import { signup, logout,handleMobileVerificationAndOTP, refreshToken, verifyOTP, sendOTP, paraSignup } from "../../controllers/auth.controller";
import { adminLogin, adminSignup} from "../../controllers/admin.controller"
import { verifyApiKey, verifyJWT } from "../../middlewares/auth.middleware";

const router = express.Router();

router.route("/refresh-token").get(refreshToken);
router.route("/signup").post(signup);
router.route("/paraexpert/signup").post(paraSignup);
router.route('/paraexpert/send-otp').post(handleMobileVerificationAndOTP);
router.route("/logout").get(logout);
router.route("/send-otp").post(sendOTP);
router.route("/verify-otp").post(verifyOTP);
router.route("/admin/signup").post(adminSignup);
router.route("/admin/login").post(adminLogin);

export default router;
