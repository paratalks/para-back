import type { Request, Response } from "express";
import { instance } from "../config/payment";
import crypto from "node:crypto";
import { Payment } from "../models/payment/payment.model";
import { ApiResponse } from "../util/apiResponse";
import { ResponseStatusCode } from "../constants/constants";

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
