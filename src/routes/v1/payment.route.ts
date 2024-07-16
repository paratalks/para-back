import express from "express";
import { checkout, paymentVerification, uploadPaymentReceipt } from "../../controllers/payment.controller";
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const uploadFile = (fieldName: string) => upload.single(fieldName);

router.route("/checkout").post(checkout)
router.route("/verification").post(paymentVerification)
router.patch('/uploadPaymentReceipt', uploadFile('paymentReceipt'),uploadPaymentReceipt);

export default router;