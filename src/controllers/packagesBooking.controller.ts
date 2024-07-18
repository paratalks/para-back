import type { Request, Response } from "express";
import { ApiError } from "../util/apiError";
import { asyncHandler } from "../util/asyncHandler";
import { ApiResponse } from "../util/apiResponse";
import { ResponseStatusCode } from "../constants/constants";
import { ParaExpert } from "../models/paraExpert/paraExpert.model";
import { User } from "../models/user/user.model";
import { PackagesBooking } from "../models/packageBooking/packageBooking.model";
import mongoose from "mongoose";
import { PackageBookingDocument } from "../models/packageBooking/packageBooking.types";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { createS3Client, bucketName } from "../util/s3Client.util";

export const uploadPrescriptionReportToS3 = async (file: Express.Multer.File): Promise<string> => {
  if (!file) {
    throw new ApiResponse(ResponseStatusCode.BAD_REQUEST, null, 'No file uploaded');
  }

  const filename = `${Date.now()}-${file.originalname}`;
  const contentType = file.mimetype;
  const fileContent = file.buffer;

  const putCommand = new PutObjectCommand({
    Bucket: bucketName,
    Key: `uploads/prescription-report/${filename}`,
    Body: fileContent,
    ContentType: contentType,
    ACL: 'public-read',
  });

  const s3Client: S3Client = createS3Client();
  await s3Client.send(putCommand);

  return `https://${bucketName}.s3.${process.env.AWS_REGION!}.amazonaws.com/uploads/prescription-report/${filename}`;
};

export const createBooking = asyncHandler(
  async (req: Request, res: Response) => {
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
      const fileUrl = await uploadPrescriptionReportToS3(req.file);
      
      const {
        packageId,
        paraExpertId,
        userId,
        location,
        questions,
        address,
        status,
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
        prescriptionReport:fileUrl,
        questions,
        bookingDate:Date.now(),
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
export const transformBookings = (bookings: PackageBookingDocument[]) => {
  return bookings.map((booking) => {
    const paraExpert = booking.paraExpertId;
    const filteredPackages = paraExpert.packages.filter(
      (pkg: PackageBookingDocument) => pkg._id.equals(booking.packageId)
    );
    return {
      ...booking.toObject(),
      paraExpertId: {
        ...paraExpert.toObject(),
        packages: filteredPackages,
      },
    };
  });
};

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
      .select("-createdAt -updatedAt -__v")
      .populate([
        {
          path: "paraExpertId",
          model: "ParaExpert",
          select: "userId packages _id",
          populate: {
            path: "userId",
            model: "User",
            select: "name profilePicture",
          },
        },
      ])
      .exec();

    const transformedBookings = transformBookings(bookings);
      //fine tuning
    
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

export const getExpertsBookings = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { paraExpertId, status } = req.query;

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
        .select("-createdAt -updatedAt -__v")
        .populate([
          {
            path: "paraExpertId",
            model: "ParaExpert",
            select: "userId packages _id",
          },
          {
            path: "userId",
            model: "User",
            select: "name profilePicture",
          },
        ])
        .exec();

      const transformedBookings = transformBookings(bookings);

      res.json(
        new ApiResponse(
          ResponseStatusCode.SUCCESS,
          transformedBookings,
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
