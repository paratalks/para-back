import express from "express";
import { checkout, paymentVerification, uploadPaymentReceipt } from "../../controllers/payment.controller";
import { upload } from "../../util/s3Client.util";
import { verifyJWT } from "../../middlewares/auth.middleware";

const router = express.Router();

router.route("/verification").post(verifyJWT,paymentVerification)
router.post('/uploadPaymentReceipt',verifyJWT,upload.single('paymentReceipt'),uploadPaymentReceipt);

export default router;