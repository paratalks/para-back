import express from "express";
const router = express.Router();

// import controllers
import { signup, login, logout, refreshToken, verifyOTP, sendOTP } from "../../controllers/auth.controller";

// import middlwares
import { isLoggedIn } from "../../middlewares/authorization";

router.route("/refresh-token").get(refreshToken);
router.route("/signup").post(signup);
router.route("/paraexpert/signup").post()
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/send-otp").post(sendOTP)
router.route("/verify-otp").post(verifyOTP)


export default router;
