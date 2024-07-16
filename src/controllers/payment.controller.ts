import type { Request, Response } from "express";
import { instance } from "../config/payment";
import crypto from "node:crypto";
import { Payment } from "../models/payment/payment.model";
import { ApiResponse } from "../util/apiResponse";
import { ResponseStatusCode } from "../constants/constants";
import { ApiError } from "../util/apiError";
import { S3Client,PutObjectCommand,GetObjectCommand } from '@aws-sdk/client-s3';

export const checkout = async (req: Request, res: Response) => {
  const options = {
    amount: Number(req.body.amount * 100),
    currency: "INR",
  };

  const order = await instance.orders.create(options);

  res.json(new ApiResponse(200,order));
};

//redirect url
export const paymentVerification = async (req: Request, res: Response) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;
  try {
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;
    if (isAuthentic) {
      await Payment.create({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });
      console.log("H")

      res.json(new ApiResponse(ResponseStatusCode.SUCCESS, "verified successfully"));
      // res.redirect(`FrontURI${}`)
    } else {
      res.json(new ApiResponse(ResponseStatusCode.UNAUTHORIZED,"unauthorised"));
    }
  } catch (error) {
    res.json(new ApiResponse(ResponseStatusCode.INTERNAL_SERVER_ERROR, "internal server error"))
  }
};

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

const bucketName = process.env.AWS_S3_BUCKET_NAME!;
//upload payment receipt
export const uploadPaymentReceipt = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json(new ApiResponse(ResponseStatusCode.BAD_REQUEST, null, 'No file uploaded'));
    }

    const filename = `${Date.now()}-${req.file.originalname}`;
    const contentType = req.file.mimetype;
    const fileContent = req.file.buffer;

    const putCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: `uploads/payment-receipt/${filename}`,
      Body: fileContent,
      ContentType: contentType,
      ACL: 'public-read',
    });

    await s3Client.send(putCommand);

    const fileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION!}.amazonaws.com/uploads/payment-receipt/${filename}`;

    return res.json(new ApiResponse(ResponseStatusCode.SUCCESS, fileUrl, "payment receipt Uploaded successfully"));
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new ApiError(
      ResponseStatusCode.INTERNAL_SERVER_ERROR,
      error.message || "Internal server error"
    );
  }
};