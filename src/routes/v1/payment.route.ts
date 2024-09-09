import express from "express";
import { checkout, paymentVerification, uploadPaymentReceipt } from "../../controllers/payment.controller";
import { uploadFile } from "../../util/s3Client.util";
import { verifyJWT } from "../../middlewares/auth.middleware";

const router = express.Router();

router.route("/verification").post(verifyJWT,paymentVerification)
router.post('/uploadPaymentReceipt', uploadFile('paymentReceipt'),uploadPaymentReceipt);

export default router;