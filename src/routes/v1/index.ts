import express from "express";
import { sendSuccessApiResponse } from "../../middlewares/successApiResponse";
import authRoute from "./auth.route";
import bookingRoute from "./appointment.route"
import userRoute from "./user.route";
import paraRoute from "./para.route"
const router = express.Router();

/**
 * Endpoint: /api/v1
 */

router.use("/auth", authRoute);
router.use("/booking",bookingRoute);
router.use("/profile-update",userRoute);
router.use("/para",paraRoute);

router.get("/", (req, res) => {
    return res.status(200).send({
        uptime: process.uptime(),
        message: "Yash's API health check :: GOOD",
        timestamp: Date.now(),
    });
});

export default router;
