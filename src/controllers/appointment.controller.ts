import type { Request, Response } from "express";
import { ApiError } from "../util/apiError";
import { asyncHandler } from "../util/asyncHandler";
import { ApiResponse } from "../util/apiResponse";
import { Appointments } from "../models/appointments/appointments.model";
import { ParaExpert } from "../models/paraExpert/paraExpert.model";
import { User } from "../models/user/user.model";
import { ObjectId } from "mongoose";
import jwt from "jsonwebtoken";
import { getAvailability } from "../util/getAvailability";
import { ResponseStatusCode } from "../constants/constants";
interface Slot {
  startTime: string;
  endTime: string;
}

interface Query {
  userId: string;
  status?: string;
}

interface BookedSlots {
  [key: string]: Slot[];
}

//user
const bookAppointment = asyncHandler(async (req: Request, res: Response) => {
  const { date, startTime, endTime, status } = req.body as {
    date: string;
    startTime: string;
    endTime: string;
    status: string;
  };
  console.log(req.body);

  const incomingToken = req.headers.token;

  if (!incomingToken) {
    throw new ApiError(ResponseStatusCode.UNAUTHORIZED, "unauthorized request");
  }

  const decodedToken: any = jwt.verify(
    incomingToken as string,
    process.env.JWT_SECRET
  );

  const user = await User.findById(decodedToken?.userId);
  const userId = user._id;
  if (!user) {
    throw new ApiError(
      ResponseStatusCode.UNAUTHORIZED,
      "Invalid refresh token"
    );
  }

  const { paraExpertId } = req.params;
  try {
    if (
      !userId ||
      !paraExpertId ||
      !date ||
      !startTime ||
      !endTime ||
      !status
    ) {
      throw new ApiError(
        ResponseStatusCode.BAD_REQUEST,
        "All fields are required"
      );
    }

    const requestedDate = new Date(date);
    const availability: String[] = await getAvailability(
      paraExpertId,
      requestedDate
    );
    const slots = availability?.find(
      (slot) =>
        slot.split("-")[0] === startTime && slot.split("-")[1] === endTime
    );

    if (!slots) {
      throw new ApiError(
        ResponseStatusCode.BAD_REQUEST,
        "Availability not found for the given date"
      );
    }

    const appointment = await Appointments.create({
      userId,
      paraExpertId,
      date,
      startTime,
      endTime,
      status,
    });

    if (!appointment) {
      throw new ApiError(
        ResponseStatusCode.BAD_REQUEST,
        "Failed to create appointment"
      );
    }

    return res.json(
      new ApiResponse(
        ResponseStatusCode.SUCCESS,
        appointment,
        "Appointment created successfully"
      )
    );
  } catch (error) {
    throw new ApiError(ResponseStatusCode.UNAUTHORIZED, error?.message);
  }
});

//user
const getBookedAppointment = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { status }:{status?:string} = req.query;
      const queryObj: Query = { userId };
      status && (queryObj.status = status);

      const appointment = await Appointments.find(queryObj);

      return res.json(
        new ApiResponse(
          ResponseStatusCode.SUCCESS,
          appointment,
          "Appointmnet fetched successfully"
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

//paraexpert
const getParaExpertTimeSlot = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { paraExpertId } = req.params;

      const appointment = Appointments.find({ paraExpertId });
    } catch (error) {}
  }
);

//paraexpert
const getParaExpertAvailability = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { paraExpertId, startDate, endDate } = req.query;

      if (!paraExpertId || !startDate || !endDate) {
        return res.json(
          new ApiResponse(
            ResponseStatusCode.BAD_REQUEST,
            "Missing required parameters"
          )
        );
      }

      const startDateObj = new Date(startDate as string);
      const endDateObj = new Date(endDate as string);

      let availableSlots: { date: string; slots: String[] }[] = [];

      let loop = new Date(startDateObj);
      while (loop <= endDateObj) {
        const slots: String[] = await getAvailability(paraExpertId, loop);

        if (slots) {
          const slots2 = {
            date: loop.toISOString().split("T")[0],
            slots: slots,
          };

          availableSlots = [...availableSlots, slots2];
        }

        let newDate = loop.setDate(loop.getDate() + 1);
        loop = new Date(newDate);
      }

      res.json(new ApiResponse(ResponseStatusCode.SUCCESS, availableSlots));
    } catch (error) {
      throw new ApiError(
        ResponseStatusCode.INTERNAL_SERVER_ERROR,
        error.message || "Internal server error"
      );
    }
  }
);

//paraexpert
const setAvailability = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { availability } = req.body as {
      availability: [{ day: number; slots: [string] }];
    };

    if (!availability) {
      throw new ApiError(
        ResponseStatusCode.BAD_REQUEST,
        "All fields are required"
      );
    }

    if (
      availability.filter((item) => item.day < 0 || item.day > 6).length > 0
    ) {
      return res.json(
        new ApiResponse(ResponseStatusCode.BAD_REQUEST, "Invalid day")
      );
    }

    const paraExpert = await ParaExpert.findByIdAndUpdate(
      req.params.paraExpertId,
      {
        $set: {
          availability,
        },
      },
      { new: true }
    );

    return res.json(
      new ApiResponse(
        ResponseStatusCode.SUCCESS,
        paraExpert,
        "ParaExpert availability updated successfully"
      )
    );
  } catch (error) {
    throw new ApiError(
      ResponseStatusCode.INTERNAL_SERVER_ERROR,
      error.message || "Internal server error"
    );
  }
});

//paraexpert
const getBookings = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { paraExpertId } = req.params;
    const appointments = await Appointments.find({ paraExpertId });
    return res.json(
      new ApiResponse(
        ResponseStatusCode.SUCCESS,
        appointments,
        "Appointmnet fetched successfully"
      )
    );
  } catch (error) {
    throw new ApiError(
      ResponseStatusCode.INTERNAL_SERVER_ERROR,
      error.message || "Internal server error"
    );
  }
});

export {
  bookAppointment,
  getBookedAppointment,
  setAvailability,
  getBookings,
  getParaExpertAvailability,
};
