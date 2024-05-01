import { Request, Response, query } from "express";
import { ApiError } from "../util/apiError";
import { asyncHandler } from "../util/asyncHandler";
import { ApiResponse } from "../util/apiResponse";
import { Appointments } from "../models/appointments/appointments.model";
import { ParaExpert } from "../models/paraExpert/paraExpert.model";
import { User } from "../models/user/user.model";
import { ObjectId } from "mongoose";
import jwt from "jsonwebtoken";
import { getAvailability } from "../util/getAvailability";
// import { object } from "zod";

interface Slot {
  startTime: string;
  endTime: string;
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
    throw new ApiError(401, "unauthorized request");
  }

  const decodedToken: any = jwt.verify(
    incomingToken as string,
    process.env.JWT_SECRET
  );

  const user = await User.findById(decodedToken?.userId);
  const userId = user._id;
  if (!user) {
    throw new ApiError(401, "Invalid refresh token");
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
      throw new ApiError(400, "All fields are required");
    }

    const d = new Date(date);
    const availability:String[] = await getAvailability(paraExpertId, d);
    const slots = availability?.find((slot)=>slot.split("-")[0]===startTime && slot.split("-")[1]===endTime)

    if(!slots){
      throw new ApiError(400, "Availability not found for the given date");
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
      throw new ApiError(400, "Failed to create appointment");
    }

    return res
      .json(
        new ApiResponse(200, appointment, "Appointment created successfully")
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

//user
const getBookedAppointment = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      let query = Appointments.find({ userId });
      const { status } = req.query;

      if (status) {
        query = query.find({ status: status });
      }

      const appointment = await query.exec();

      return res
        .json(
          new ApiResponse(200, appointment, "Appointmnet fetched successfully")
        );
    } catch (error) {}
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
        return res.json(new ApiResponse(400,"Missing required parameters"));
      }

      const startDateObj = new Date(startDate as string);
      const endDateObj = new Date(endDate as string);

      let availableSlots: { date: string; slots: String[] }[] = [];

      let loop = new Date(startDateObj);
      while (loop <= endDateObj) {
        const slots:String[] = await getAvailability(paraExpertId, loop);

        if(slots){
          const slots2 = {
            date: loop.toISOString().split("T")[0],
            slots: slots,
          };

          availableSlots = [...availableSlots, slots2];
        }

        let newDate = loop.setDate(loop.getDate() + 1);
        loop = new Date(newDate);
      }

      res.json(new ApiResponse(200, availableSlots ));
    } catch (error) {}
  }
);

//paraexpert
const setAvailability = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { availability } = req.body as {
      availability: [{ day: number; slots: [string] }];
    };

    if (!availability) {
      throw new ApiError(400, "All fields are required");
    }

    if (
      availability.filter((item) => item.day < 0 || item.day > 6).length > 0
    ) {
      return res.json(new ApiResponse(400, "Invalid day"));
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

    return res
      .json(
        new ApiResponse(
          200,
          paraExpert,
          "ParaExpert availability updated successfully"
        )
      );
  } catch (error) {}
});

//paraexpert
const getBookings = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { paraExpertId } = req.params;
    const appointments = await Appointments.find({ paraExpertId });
    return res
      .json(
        new ApiResponse(200, appointments, "Appointmnet fetched successfully")
      );
  } catch (error) {}
});

export {
  bookAppointment,
  getBookedAppointment,
  setAvailability,
  getBookings,
  getParaExpertAvailability,
};
