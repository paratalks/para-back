import type { Request, Response } from "express";
import { instance } from "../config/payment";
import crypto from "node:crypto";
import { Payment } from "../models/payment/payment.model";
import { ApiResponse } from "../util/apiResponse";
import { ResponseStatusCode } from "../constants/constants";
import { ApiError } from "../util/apiError";
import { uploadfileToS3 } from '../util/s3Client.util';
import { sendNotif } from "../util/notification.util";
import { notification } from "../util/notification.util";
import { Appointments } from "../models/appointments/appointments.model";
import { User } from "../models/user/user.model";
import { ParaExpert } from "../models/paraExpert/paraExpert.model";


export const checkout = async (amount: number, bookingId: string) => {
  try {
    const options = {
      amount: Number(amount * 100),
      currency: 'INR',
      receipt: `receipt_${bookingId}`,
    };

    const order = await instance.orders.create(options);

    return {
      status: ResponseStatusCode.SUCCESS,
      data: order,
      message: 'Order created successfully'
    };
    } catch (error) {
      console.error('Error during checkout:', error);
      throw new ApiResponse(ResponseStatusCode.INTERNAL_SERVER_ERROR, 'Error during checkout');
    }  
};

export const paymentVerification = async (req: Request, res: Response) => {
  const { Gateway_order_id, Gateway_payment_id, Gateway_signature, amount, bookingId, userId, paraExpertId, paymentReceiptUrl,status } = req.body;

  try {
    const body = `${Gateway_order_id}|${Gateway_payment_id}`;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === Gateway_signature;
   
    if (isAuthentic) {
      return res.json(new ApiResponse(ResponseStatusCode.UNAUTHORIZED, 'Unauthorized'));
    }

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
        status,
      });

      const savedPayment = await newPayment.save();

      const booking = await Appointments.findById(bookingId);
      if (!booking) {
        throw new ApiError(ResponseStatusCode.NOT_FOUND, 'Booking not found');
      }
  
      booking.status = 'pending';
      const appointment = await booking.save();
      
      const bookingdate = appointment?.date.toISOString().split("T")[0];
      const startTime = appointment?.startTime;
      const endTime = appointment?.endTime;
      const appointmentMethod = appointment?.appointmentMethod;

    const bookingUser = await User.findById(userId);

    const paraExpert = await ParaExpert.findById(paraExpertId);
    if (!paraExpert) {
      throw new ApiError(
        ResponseStatusCode.BAD_REQUEST,
        "Para expert not found"
      );
    }
    const paraExpertUser = await User.findById(paraExpert.userId);
    if (!paraExpertUser) {
      throw new ApiError(
        ResponseStatusCode.BAD_REQUEST,
        "FCM token not found for para expert user"
      );
    }
         
      await sendNotif(
        bookingUser.fcmToken,
        "Booking Placed",
        `Your ${appointmentMethod} appointment request has been received for ${bookingdate} from ${startTime} to ${endTime}.`,
        appointment._id
      );
  
      const createNotification = await notification(
        userId,
        "Booking Placed",
        `Your ${appointmentMethod} appointment request has been received for ${bookingdate} from ${startTime} to ${endTime}.`,
        "appointment",
        appointment._id
      );
  
      if (!createNotification) {
        throw new ApiError(
          ResponseStatusCode.BAD_REQUEST,
          "Failed to create notification"
        );
      }
  
      await sendNotif(
        paraExpertUser.fcmToken,
        "New Booking Request",
        `You have a new ${appointmentMethod} appointment request for ${bookingdate} from ${startTime} to ${endTime}.`,
        appointment?._id
      );
  
      const createParaExpertNotification = await notification(
        paraExpertUser._id,
        "New booking request",
        `You have a new ${appointmentMethod} appointment request for ${bookingdate} from ${startTime} to ${endTime}`,
        "appointment",
        appointment._id,
        bookingUser?.profilePicture
      );
      
      if (!createParaExpertNotification) {
        throw new ApiError(
          ResponseStatusCode.BAD_REQUEST,
          "Failed to create notification"
        );
      }

      res.json(new ApiResponse(ResponseStatusCode.SUCCESS, savedPayment, 'Payment verified and saved successfully'));
    } 
   catch (error) {
    res.json(new ApiResponse(ResponseStatusCode.INTERNAL_SERVER_ERROR, error.message || 'Internal server error'));
  }
}
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
}