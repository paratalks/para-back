import type { Request, Response } from "express";
import { instance } from "../config/payment";
import crypto from "node:crypto";
import { Payment } from "../models/payment/payment.model";
import { ApiResponse } from "../util/apiResponse";
import { ResponseStatusCode } from "../constants/constants";
import { ApiError } from "../util/apiError";
import { S3Client,PutObjectCommand,GetObjectCommand } from '@aws-sdk/client-s3';
import { uploadfileToS3 } from '../util/s3Client.util';


export const checkout = async (req: Request, res: Response) => {
  try {
    const { amount, bookingId } = req.body;

    const options = {
      amount: Number(amount * 100),
      currency: 'INR',
      receipt: `receipt_${bookingId}`,
    };

    const order = await instance.orders.create(options);

    res.json(new ApiResponse(ResponseStatusCode.SUCCESS, order, 'Order created successfully'));
  } catch (error) {
    console.error('Error during checkout:', error);
    res.status(500).json(new ApiResponse(ResponseStatusCode.INTERNAL_SERVER_ERROR, 'Error during checkout'));
  }
};

export const paymentVerification = async (req: Request, res: Response) => {
  const { Gateway_order_id, Gateway_payment_id, Gateway_signature, amount, bookingId,userId, paraExpertId, paymentReceiptUrl } = req.body;

  try {
    const body = `${Gateway_order_id}|${Gateway_payment_id}`;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === Gateway_signature;
    if (!isAuthentic) {
      const newPayment = new Payment({
        GatewayDetails: {
          order_id: Gateway_order_id,
          payment_id: Gateway_payment_id,
          signature: Gateway_signature,
        },
        amount,
        bookingId,
        userId,
        paraExpertId,
        paymentReceiptUrl,
        status: 'completed',
      });

      const savedPayment = await newPayment.save();

      res.json(new ApiResponse(ResponseStatusCode.SUCCESS, savedPayment, 'Payment verified and saved successfully'));
    } else {
      res.json(new ApiResponse(ResponseStatusCode.UNAUTHORIZED, 'Unauthorized'));
    }
  } catch (error) {
    res.json(new ApiResponse(ResponseStatusCode.INTERNAL_SERVER_ERROR, error.message || 'Internal server error'));
  }
};

export const uploadPaymentReceipt = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json(new ApiResponse(ResponseStatusCode.BAD_REQUEST, null, 'No file uploaded'));
    }

    const fileUrl = await uploadfileToS3(req.file, "payment-receipt");

    return res.json(new ApiResponse(ResponseStatusCode.SUCCESS, fileUrl, "payment receipt Uploaded successfully"));
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new ApiError(
      ResponseStatusCode.INTERNAL_SERVER_ERROR,
      error.message || "Internal server error"
    );
  }
};