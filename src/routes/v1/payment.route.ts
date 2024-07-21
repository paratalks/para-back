import express from "express";
import { checkout, paymentVerification, uploadPaymentReceipt } from "../../controllers/payment.controller";
import { uploadFile } from "../../util/s3Client.util";

const router = express.Router();

router.route("/checkout").post(checkout)
router.route("/verification").post(paymentVerification)
router.patch('/uploadPaymentReceipt', uploadFile('paymentReceipt'),uploadPaymentReceipt);

export default router;