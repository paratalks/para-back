import express from "express";
const router = express.Router();

// import controllers
import { signup, login, logout, refreshToken } from "../../controllers/auth.controller";

// import middlwares
import { isLoggedIn } from "../../middlewares/authorization";

router.route("/refresh-token").get(refreshToken);
router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").get(logout);

export default router;
