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

export const createBooking = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      let fileUrl:string = "";
      if (req?.file) {
        fileUrl = await uploadfileToS3(req.file, "prescription-report");
      } else {
        console.log("No file uploaded, proceeding without file.");
      }
      
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

      if (!packageId || !paraExpertId || !userId || !location) {
        throw new ApiError(
          ResponseStatusCode.BAD_REQUEST,
          "All fields are required"
        );
      }

      const paraExpert = await ParaExpert.findById(paraExpertId);
      if (!paraExpert) {
        throw new ApiError(
          ResponseStatusCode.NOT_FOUND,
          "ParaExpert not found"
        );
      }

      const booking = new PackagesBooking({
        packageId,
        paraExpertId,
        userId,
        location,
        prescriptionReport: fileUrl,
        questions,
        bookingDate:bookingDate || Date.now(),
        address,
        status,
      });

      await booking.save();

      res.json(
        new ApiResponse(
          ResponseStatusCode.SUCCESS,
          booking,
          "Package booking created successfully"
        )
      );
    } catch (error) {
      res
        .status(error.statusCode || 500)
        .json(
          new ApiError(ResponseStatusCode.INTERNAL_SERVER_ERROR, error.message)
        );
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

export const getbookingByPackageById = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const user = req.user;
      const userId = user._id;
      if (!userId) {
        throw new ApiError(ResponseStatusCode.UNAUTHORIZED, "UNAUTHORIZED User ID is required");
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

export const getExpertsBookings = asyncHandler(
  async (req: Request, res: Response) => {
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

const validStatuses = [
  "pending",
  "confirmed",
  "cancelled",
  "rescheduled",
  "scheduled",
] as const;
type BookingStatus = typeof validStatuses[number];

export const updateBookingStatus = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { bookingId } = req.params;
      const { status } = req.query;

      if (!status) {
        throw new ApiError(
          ResponseStatusCode.BAD_REQUEST,
          "Status is required"
        );
      }

      const booking = await PackagesBooking.findById(bookingId);
      if (!booking) {
        throw new ApiError(ResponseStatusCode.NOT_FOUND, "Booking not found");
      }

      if (
        !status ||
        typeof status !== "string" ||
        !validStatuses.includes(status as BookingStatus)
      ) {
        throw new ApiError(
          ResponseStatusCode.BAD_REQUEST,
          "Valid status is required"
        );
      }
      booking.status = status as BookingStatus;
      await booking.save();

      res.json(
        new ApiResponse(
          ResponseStatusCode.SUCCESS,
          booking,
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
