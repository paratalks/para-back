import express from "express";
import { sendSuccessApiResponse } from "../../middlewares/successApiResponse";
import authRoute from "./auth.route";
import bookingRoute from "./appointment.route"
import userRoute from "./user.route";
import paraRoute from "./para.route"
import homeRoute from "./home.route"
import paymentRoute from "./payment.route"
import tokenRoute from "./token.route"
import reviewRoute from "./review.route"
import adminRoutes from "./admin.route"
import packagesbookingRoute from "./packageBooking.routes"
import packagesRoutes from "./package.route"

const router = express.Router();

/**
 * Endpoint: /api/v1
 */

router.use("/auth", authRoute);
router.use("/booking",bookingRoute);
router.use("/para/package",packagesRoutes);
router.use("/package",packagesbookingRoute);
router.use("/user",userRoute);
router.use("/para",paraRoute);
router.use("/home",homeRoute);
router.use("/payment",paymentRoute)
router.use("/token",tokenRoute)
router.use("/review",reviewRoute)
router.use("/admin",adminRoutes);

router.get("/", (req, res) => {
    return res.status(200).send({
        uptime: process.uptime(),
        message: "Paratalks API health check :: GOOD",
        timestamp: Date.now(),
    });
});

export default router;
