import express from "express";
import { generateRTCToken, generateRTEToken, generateRTMToken, ping, nocache } from "../../controllers/generateToken.controller";

const router = express.Router();
//need to upgrade the req data and some changes in controller
router.route("/ping").get(ping);
router.route("/rtc").get(generateRTCToken);
router.route("/rtm").get(generateRTMToken);


export default router
