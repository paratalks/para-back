import type { Request, Response } from "express";
import { instance } from "../server";
import crypto from "node:crypto"
import { Payment } from "../models/payment/payment.model";

export const checkout = async (req:  Request,res: Response) => {
    const options = {
        amount : Number(req.body.amount * 100),
        currency: "INR",
    };

    const order = await instance.orders.create(options);

    res.status(200).json({
        success:true,
        order
    });
}


//redirect url 
export const paymentVerification = async (req: Request,res: Response) => {
    const {razorpay_order_id, razorpay_payment_id, razorpay_signature} = req.body
    try {
        const body = `${razorpay_order_id}|${razorpay_payment_id}`;

        const expectedSignature = crypto
            .createHmac("sha265",process.env.RAZORPAY_API_SECRET)
            .update(body.toString())
            .digest("hex")

        const isAuthentic = expectedSignature === razorpay_signature;
        if(isAuthentic) {
            await Payment.create({
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature
            });

            res.redirect(`FrontURI${}`)
        }else {
            res.status(400).json({
                success: false
            })
        }
    } catch (error) {
        
    }
}
