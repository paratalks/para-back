import express from "express";
import { checkout, paymentVerification, uploadPaymentReceipt } from "../../controllers/payment.controller";
import { upload } from "../../util/s3Client.util";

const router = express.Router();

router.route("/verification").post(paymentVerification)
router.post('/uploadPaymentReceipt', upload.single('paymentReceipt'),uploadPaymentReceipt);

export default router;