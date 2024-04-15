import express from "express";
const router = express.Router();

// import controllers
import { signup, login, logout, refreshToken, sendOTP } from "../../controllers/auth.controller";

// import middlwares
import { isLoggedIn } from "../../middlewares/authorization";

router.route("/refresh-token").get(refreshToken);
router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/send-otp").post(sendOTP)

export default router;
