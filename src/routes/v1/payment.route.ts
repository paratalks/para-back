import express from "express";
import { checkout, paymentVerification } from "../../controllers/payment.controller";

const router = express.Router();

router.route("/checkout").post(checkout)
router.route("/verification").post(paymentVerification)

export default router;