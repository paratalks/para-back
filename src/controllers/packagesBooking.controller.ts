import type { Request, Response } from "express";
import { ApiError } from "../util/apiError";
import { asyncHandler } from "../util/asyncHandler";
import { ApiResponse } from "../util/apiResponse";
import { ResponseStatusCode } from "../constants/constants";
import { ParaExpert } from "../models/paraExpert/paraExpert.model";
import { User } from "../models/user/user.model";
import { PackagesBooking } from "../models/packageBooking/packageBooking.model";
import { uploadfileToS3 } from "../util/s3Client.util";
import { IPackage } from "../models/paraExpert/paraExpert.types";
import { sendNotif, notification } from "../util/notification.util";
import { checkout } from "./payment.controller";

export const createBooking = asyncHandler(async (req: Request, res: Response) => {
  try {
    let fileUrl: string = "";

    if (req?.file) {
      const localFilePath = req.file.path;
      fileUrl = await uploadfileToS3(localFilePath, "prescription-report");
    }

    const {
      packageId,
      amount,
      packageType,
      paraExpertId,
      userId,
      location,
      questions,
      address,
      status,
      bookingDate,
    } = req.body;

    if (!packageId || !paraExpertId || !userId || !location) {
      throw new ApiError(
        ResponseStatusCode.BAD_REQUEST,
        "All fields are required"
      );
    }

    const booking = new PackagesBooking({
      packageId,
      packageType,
      paraExpertId,
      userId,
      location,
      prescriptionReport: fileUrl,
      questions,
      bookingDate: bookingDate || Date.now(),
      address,
      status,
    });

    const checkoutResult = await checkout(amount, booking._id.toString());

    const bookedPackage = await booking.save();
    const date = new Date(bookingDate || Date.now())
      .toISOString()
      .split("T")[0];

    const bookingUser = await User.findById(userId);
    if (!bookingUser) {
      throw new ApiError(
        ResponseStatusCode.BAD_REQUEST,
        "Booking user not found"
      );
    }

    await sendNotif(
      bookingUser.fcmToken,
      "Package Request Received",
      `Your package booking request has been successfully placed. The booking will scheduled for ${date} at ${address}. Please proceed your payment`,
      bookedPackage._id
    );

    await notification(
      userId,
      "Package Request Received",
      `Your package booking request has been successfully placed. The booking will scheduled for ${date} at ${address}. Please proceed your payment`,
      `${bookedPackage.packageId}`,
      bookedPackage._id
    );

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
      paraExpertUser.fcmToken,
      "New Package Booking Request",
      `You have a new package booking request from ${bookingUser.name}. The booking is scheduled for ${date} at ${address}. Your payment is currently being processed`,
      bookedPackage._id
    );

    const createParaExpertNotification = await notification(
      paraExpertUser._id,
      "New Package Booking Request",
      `You have a new package booking request from ${bookingUser.name}. The booking is scheduled for ${date} at ${address}. Your payment is currently being processed`,
      `${bookedPackage.packageId}`,
      bookedPackage._id,
      bookingUser.profilePicture
    );

    res.json(
      new ApiResponse(
        ResponseStatusCode.SUCCESS,
        {
          bookingId: booking._id,
          paymentOrder: checkoutResult.data
        },
        "Package booking created successfully"
      )
    );
  } catch (error) {
    const statusCode =
      error.statusCode || ResponseStatusCode.INTERNAL_SERVER_ERROR;
    const message = error.message || "Internal server error";

    res.status(statusCode).json(new ApiError(statusCode, message));
  }
}
);

export const getBookings = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { userId, status } = req.query;

    if (!userId) {
      throw new ApiError(ResponseStatusCode.BAD_REQUEST, "User ID is required");
    }

    const queryObj: any = { userId };
    if (status) {
      queryObj.status = status;
    }

    const bookings = await PackagesBooking.find(queryObj)
      .select("-createdAt -updatedAt -__v -questions")
      .populate([
        {
          path: "paraExpertId",
          model: "ParaExpert",
          select: "userId _id",
          populate: [
            {
              path: "userId",
              model: "User",
              select: "name profilePicture",
            },
          ],
        },
      ])
      .exec();

    res.json(
      new ApiResponse(
        ResponseStatusCode.SUCCESS,
        bookings,
        "Package bookings fetched successfully"
      )
    );
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json(
        new ApiError(
          error.statusCode || ResponseStatusCode.INTERNAL_SERVER_ERROR,
          error.message || "Internal server error"
        )
      );
  }
});

export const getbookingByPackageById = asyncHandler(async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const userId = user._id;
    if (!userId) {
      throw new ApiError(
        ResponseStatusCode.UNAUTHORIZED,
        "UNAUTHORIZED User ID is required"
      );
    }
    const { packageId, bookingId } = req.query;

    const bookings = await PackagesBooking.findById(bookingId)
      .select("-createdAt -updatedAt -__v")
      .populate([
        {
          path: "userId",
          model: "User",
          select: "name profilePicture",
        },
        {
          path: "paraExpertId",
          model: "ParaExpert",
          select: "userId _id",
          populate: [
            {
              path: "userId",
              model: "User",
              select: "name profilePicture",
            },
          ],
        },
      ])
      .exec();

    const paraExpert = await ParaExpert.findById(bookings?.paraExpertId);
    if (!paraExpert) {
      throw new ApiError(
        ResponseStatusCode.NOT_FOUND,
        "Para Expert Not Found"
      );
    }

    const packageIndex = paraExpert.packages.findIndex(
      (pkg: IPackage) => pkg._id?.toString() === packageId
    );
    if (packageIndex === -1) {
      throw new ApiError(ResponseStatusCode.NOT_FOUND, "Package Not Found");
    }

    const packageDetail = paraExpert.packages[packageIndex];
    return res.json(
      new ApiResponse(
        ResponseStatusCode.SUCCESS,
        { bookings, packageDetail },
        "Fetched bookings Details successfully"
      )
    );
  } catch (error) {
    throw new ApiError(
      ResponseStatusCode.INTERNAL_SERVER_ERROR,
      error.message || "Internal server error"
    );
  }
}
);

export const getExpertsBookings = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const user = req.user;
    const userId = user._id;
    const paraExpertId = await ParaExpert.findOne({ userId });
    if (!paraExpertId) {
      throw new ApiError(
        ResponseStatusCode.BAD_REQUEST,
        "ParaExpert ID is required"
      );
    }
    const queryObj: any = { paraExpertId };
    if (status) {
      queryObj.status = status;
    }

    const bookings = await PackagesBooking.find(queryObj)
      .select("-createdAt -updatedAt -__v -questions")
      .populate([
        {
          path: "userId",
          model: "User",
          select: "name profilePicture",
        },
      ])
      .exec();

    res.json(
      new ApiResponse(
        ResponseStatusCode.SUCCESS,
        bookings,
        "Package bookings fetched successfully"
      )
    );
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json(
        new ApiError(
          error.statusCode || ResponseStatusCode.INTERNAL_SERVER_ERROR,
          error.message || "Internal server error"
        )
      );
  }
}
);

export const updatePackageBooking = asyncHandler(async (req: Request, res: Response) => {
  const { bookingId } = req.params;
  try {
    const {
      packageId,
      paraExpertId,
      userId,
      location,
      questions,
      address,
      status,
      bookingDate,
    } = req.body;

    if (!bookingId) {
      throw new ApiError(
        ResponseStatusCode.BAD_REQUEST,
        "Booking ID is required"
      );
    }

    const booking = await PackagesBooking.findById(bookingId);
    if (!booking) {
      throw new ApiError(ResponseStatusCode.NOT_FOUND, "Booking not found");
    }

    if (packageId) booking.packageId = packageId;
    if (paraExpertId) booking.paraExpertId = paraExpertId;
    if (userId) booking.userId = userId;
    if (location) booking.location = location;
    if (questions) booking.questions = questions;
    if (address) booking.address = address;
    if (status) booking.status = status;
    if (bookingDate) booking.bookingDate = bookingDate;

    const updatedBooking = await booking.save();
    const date = new Date(booking.bookingDate).toISOString().split("T")[0];

    const bookingUser = await User.findById(updatedBooking.userId);
    if (!bookingUser) {
      throw new ApiError(
        ResponseStatusCode.BAD_REQUEST,
        "Booking user not found"
      );
    }

    await sendNotif(
      bookingUser.fcmToken,
      "Package Booking Rescheduling in Progress",
      `Your package booking has been successfully rescheduled to ${date} at ${address}. We'll notify you once if the expert confirms`,
      updatedBooking._id
    );

    const updateNotification = await notification(
      bookingUser._id,
      "Package Booking Rescheduling in Progress",
      `Your package booking has been successfully rescheduled to ${date} at ${address}. We'll notify you once if the expert confirms`,
      `${updatedBooking.packageId}`,
      updatedBooking._id
    );

    const paraExpert = await ParaExpert.findById(updatedBooking.paraExpertId);
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
      paraExpertUser.fcmToken,
      "Package Booking Rescheduling Request",
      `A package booking Request has been rescheduled by the ${bookingUser.name} to ${date} at ${address}. Please review !!.`,
      updatedBooking._id
    );

    const updateParaExpertNotification = await notification(
      paraExpertUser._id,
      "Package Booking Rescheduling Request",
      `A package booking Request has been rescheduled by the ${bookingUser.name} to ${date} at ${address}. Please review and confirm your availability !!.`,
      `${updatedBooking.packageId}`,
      updatedBooking._id,
      bookingUser.profilePicture
    );

    if (!updateParaExpertNotification) {
      throw new ApiError(
        ResponseStatusCode.BAD_REQUEST,
        "Failed to create notification"
      );
    }

    res.json(
      new ApiResponse(
        ResponseStatusCode.SUCCESS,
        updatedBooking,
        "Package booking updated successfully"
      )
    );
  } catch (error) {
    console.error("Error updating booking:", error);

    const statusCode =
      error.statusCode || ResponseStatusCode.INTERNAL_SERVER_ERROR;
    const message = error.message || "Internal server error";

    res.status(statusCode).json(new ApiError(statusCode, message));
  }
}
);

type BookingStatus = "completed" | "confirmed" | "cancelled";

export const updateBookingStatus = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.query;

    if (!status) {
      throw new ApiError(
        ResponseStatusCode.BAD_REQUEST,
        "Status is required"
      );
    }

    const packBooking = await PackagesBooking.findById(bookingId);
    if (!packBooking) {
      throw new ApiError(ResponseStatusCode.NOT_FOUND, "Booking not found");
    }
    packBooking.status = status as BookingStatus;
    const pakBooking = await packBooking.save();

    const date = pakBooking?.bookingDate.toISOString().split("T")[0];
    const address = pakBooking.address;
    const packageId = pakBooking.packageId.toString();

    const bookingUser = await User.findById(packBooking?.userId);
    const paraExpert = await ParaExpert.findById(packBooking?.paraExpertId);
    const paraExpertUser = await User.findById(paraExpert.userId);
    if (!paraExpertUser) {
      throw new ApiError(
        ResponseStatusCode.BAD_REQUEST,
        "FCM token not found for para expert user"
      );
    }

    const statusMessages: Record<
      BookingStatus,
      {
        title: string;
        message: string;
        paraExpertMessage: string;
        paraExpertTitle: string;
      }
    > = {
      confirmed: {
        title: "Package Booking Confirmed",
        message: `Your package booking has been confirmed for ${date} at ${address}.`,
        paraExpertMessage: `You have a package booking confirmed for ${date} at ${address}.`,
        paraExpertTitle: "Package Booking Scheduled",
      },
      cancelled: {
        title: "Package Booking Cancelled",
        message: `Your package booking for ${date} at ${address} has been cancelled.`,
        paraExpertMessage: `The package booking scheduled for ${date} at ${address} has been cancelled.`,
        paraExpertTitle: "Package Booking Cancelled",
      },
      completed: {
        title: "Package Booking Completed",
        message: `Your package booking on ${date} at ${address} has been completed.`,
        paraExpertMessage: `The package booking with the ${bookingUser?.name} on ${date} at ${address} has been completed.`,
        paraExpertTitle: "Package Booking Completed",
      },
    };

    const { title, message, paraExpertMessage, paraExpertTitle } =
      statusMessages[status as BookingStatus];

    // Notify the user
    await sendNotif(bookingUser.fcmToken, title, message, bookingId);

    await notification(
      bookingUser._id,
      title,
      message,
      packageId,
      bookingId,
      paraExpertUser.profilePicture
    );

    await sendNotif(
      paraExpertUser.fcmToken,
      paraExpertTitle,
      paraExpertMessage,
      bookingId
    );

    await notification(
      paraExpertUser._id,
      paraExpertTitle,
      paraExpertMessage,
      packageId,
      bookingId,
      bookingUser.profilePicture
    );
    res.json(
      new ApiResponse(
        ResponseStatusCode.SUCCESS,
        pakBooking,
        "Booking status updated successfully"
      )
    );
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json(
        new ApiError(
          error.statusCode || ResponseStatusCode.INTERNAL_SERVER_ERROR,
          error.message || "Internal server error"
        )
      );
  }
}
);
