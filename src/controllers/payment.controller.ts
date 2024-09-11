import type { Request, Response } from "express";
import { instance } from "../config/payment";
import crypto from "node:crypto";
import { Payment } from "../models/payment/payment.model";
import { ApiResponse } from "../util/apiResponse";
import { ResponseStatusCode } from "../constants/constants";
import { ApiError } from "../util/apiError";
import { uploadfileToS3 } from "../util/s3Client.util";
import { sendNotif } from "../util/notification.util";
import { notification } from "../util/notification.util";
import { Appointments } from "../models/appointments/appointments.model";
import { User } from "../models/user/user.model";
import { ParaExpert } from "../models/paraExpert/paraExpert.model";
import { PackagesBooking } from "../models/packageBooking/packageBooking.model";
import { asyncHandler } from "../util/asyncHandler";

export const checkout = async (amount: number, bookingId: string) => {
  try {
    const options = {
      amount: Number(amount * 100),
      currency: "INR",
      receipt: `receipt_${bookingId}`,
    };

    const order = await instance.orders.create(options);

    return {
      status: ResponseStatusCode.SUCCESS,
      data: order,
      message: "Order created successfully",
    };
  } catch (error) {
    console.error("Error during checkout:", error);
    throw new ApiResponse(
      ResponseStatusCode.INTERNAL_SERVER_ERROR,
      "Error during checkout"
    );
  }
};

export const paymentVerification = asyncHandler(async (req: Request, res: Response) => {
  const {
    Gateway_order_id,
    Gateway_payment_id,
    Gateway_signature,
    amount,
    bookingId,
    bookingMethod,
    userId,
    paraExpertId,
    paymentReceiptUrl,
    status,
  } = req.body;

  try {
    const body = `${Gateway_order_id}|${Gateway_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === Gateway_signature;

    if (!isAuthentic) {
      if (status === 'failed' || 'pending') {
        const bookingUser = await User.findById(userId);
        if (bookingMethod === "appointment") {

          await Appointments.deleteOne({ _id: bookingId });

          await sendNotif(
            bookingUser.fcmToken,
            "Booking Canceled",
            `Your appointment request has been canceled due to payment failure.`,
            bookingId
          );

          await notification(
            userId,
            "Booking Canceled",
            `Your appointment request has been canceled due to payment failure.`,
            "appointment",
            bookingId
          );
        }
        else if (bookingMethod === "package") {
          await PackagesBooking.deleteOne({ _id: bookingId });

          await sendNotif(
            bookingUser.fcmToken,
            "Booking Canceled",
            `Your Package Booking request has been canceled due to payment failure.`,
            bookingId
          );

          await notification(
            userId,
            "Booking Canceled",
            `Your Package Booking request has been canceled due to payment failure.`,
            "appointment",
            bookingId
          );
        }
      }
      return res.json(
        new ApiResponse(ResponseStatusCode.UNAUTHORIZED, "Payment failed and booking deleted")
      );
    }

    const newPayment = new Payment({
      GatewayDetails: {
        order_id: Gateway_order_id,
        payment_id: Gateway_payment_id,
        signature: Gateway_signature,
      },
      amount,
      bookingId,
      bookingMethod,
      userId,
      paraExpertId,
      paymentReceiptUrl,
      status,
    });

    const savedPayment = await newPayment.save();

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

    if (bookingMethod === "appointment") {
      const booking = await Appointments.findById(bookingId);
      if (!booking) {
        throw new ApiError(ResponseStatusCode.NOT_FOUND, "Booking not found");
      }
      booking.status = "pending";
      const appointment = await booking.save();

      const bookingdate = appointment?.date.toISOString().split("T")[0];
      const startTime = appointment?.startTime;
      const endTime = appointment?.endTime;
      const appointmentMethod = appointment?.appointmentMethod;

      await sendNotif(
        bookingUser.fcmToken,
        "Booking Placed",
        `Your ${appointmentMethod} appointment request has been received for ${bookingdate} from ${startTime} to ${endTime}.`,
        appointment._id
      );

      await notification(
        userId,
        "Booking Placed",
        `Your ${appointmentMethod} appointment request has been received for ${bookingdate} from ${startTime} to ${endTime}.`,
        "appointment",
        appointment._id
      );


      await sendNotif(
        paraExpertUser.fcmToken,
        "New Booking Request",
        `You have a new appointment request for ${bookingdate} from ${startTime} to ${endTime}.`,
        appointment._id
      );

      await notification(
        paraExpertUser._id,
        "New booking request",
        `You have a new appointment request for ${bookingdate} from ${startTime} to ${endTime}.`,
        "appointment",
        appointment._id,
        bookingUser?.profilePicture
      );
    }
    else if (bookingMethod === "package") {
      const packBooking = await PackagesBooking.findById(bookingId);
      if (!packBooking) {
        throw new ApiError(ResponseStatusCode.NOT_FOUND, "Booking not found");
      }

      packBooking.status = "pending";
      const pakBooking = await packBooking.save();

      const date = pakBooking?.bookingDate.toISOString().split("T")[0];
      const address = pakBooking.address;
      const packageId = pakBooking.packageId.toString();

      await sendNotif(
        bookingUser.fcmToken,
        "Package Booking Placed",
        `Your package booking request has been successfully placed. The booking will scheduled for ${date} at ${address}.`,
        pakBooking._id
      );

      const createNotification = await notification(
        userId,
        "Package Booking Placed",
        `Your package booking request has been successfully placed. The booking will scheduled for ${date} at ${address}.`,
        packageId,
        pakBooking._id,
        bookingUser.profilePicture
      );

      if (!createNotification) {
        throw new ApiError(
          ResponseStatusCode.BAD_REQUEST,
          "Failed to create notification"
        );
      }

      await sendNotif(
        paraExpertUser.fcmToken,
        "New Package Booking Request",
        `You have a new package booking request from ${bookingUser.name}. The booking is scheduled for ${date} at ${address}.`,
        pakBooking._id
      );

      const createParaExpertNotification = await notification(
        paraExpertUser._id,
        "New Package Booking Request",
        `You have a new package booking request from ${bookingUser.name}. The booking is scheduled for ${date} at ${address}.`,
        `${pakBooking.packageId}`,
        pakBooking._id,
        bookingUser.profilePicture
      );
      if (!createParaExpertNotification) {
        throw new ApiError(
          ResponseStatusCode.BAD_REQUEST,
          "Failed to create notification"
        );
      }
    }
    res.json(
      new ApiResponse(
        ResponseStatusCode.SUCCESS,
        savedPayment,
        "Payment verified and saved successfully"
      )
    );
  } catch (error) {
    res.json(
      new ApiResponse(
        ResponseStatusCode.INTERNAL_SERVER_ERROR,
        error.message || "Internal server error"
      )
    );
  }
});

export const uploadPaymentReceipt = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            ResponseStatusCode.BAD_REQUEST,
            null,
            "No file uploaded"
          )
        );
    }
    const localFilePath = req.file.path;

    const fileUrl = await uploadfileToS3(localFilePath, "payment-receipt");

    return res.json(
      new ApiResponse(
        ResponseStatusCode.SUCCESS,
        fileUrl,
        "payment receipt Uploaded successfully"
      )
    );
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new ApiError(
      ResponseStatusCode.INTERNAL_SERVER_ERROR,
      error.message || "Internal server error"
    );
  }
});
