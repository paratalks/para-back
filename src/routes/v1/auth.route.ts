import express from "express";
const router = express.Router();

// import controllers
import { signup, logout, refreshToken, verifyOTP, sendOTP, paraSignup } from "../../controllers/auth.controller";

// import middlwares
import { verifyJWT } from "../../middlewares/auth.middleware";

router.route("/refresh-token").get(refreshToken);
router.route("/signup").post(verifyJWT,signup);
router.route("/paraexpert/signup").post(verifyJWT,paraSignup)
router.route("/logout").get(logout);
router.route("/send-otp").post(sendOTP);
router.route("/verify-otp").post(verifyOTP);

export default router;
