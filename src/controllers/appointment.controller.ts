import type { Request, Response } from "express";
import { ApiError } from "../util/apiError";
import { asyncHandler } from "../util/asyncHandler";
import { ApiResponse } from "../util/apiResponse";
import { Appointments } from "../models/appointments/appointments.model";
import { getAvailableSlots } from "../util/paraexpert.util";
import { ResponseStatusCode } from "../constants/constants";
import { getSlotAvailability } from "../util/paraexpert.util";
import { Notifications } from "../models/notification/notification.model";
import type { ObjectId } from "mongoose";
import { notification } from "../util/notification.util";

interface Query {
  userId: string;
  status?: string;
}

//user
const bookAppointment = asyncHandler(async (req: Request, res: Response) => {
  const { date, startTime, endTime, status,image } = req.body as {
    date: Date;
    startTime: string;
    endTime: string;
    status: string;
    title:string, //constant
    description:string, //particular time vagerah jab book hua
    referrer:string, //appointment
    referrerId: ObjectId,  // appointmentId
    image:string// paraImage
  };

  // const incomingToken = req.headers.token;

  // if (!incomingToken) {
  //   throw new ApiError(ResponseStatusCode.UNAUTHORIZED, "unauthorized request");
  // }

  // const decodedToken: any = jwt.verify(
  //   incomingToken as string,
  //   process.env.JWT_SECRET
  // );

  // const user = await User.findById(decodedToken?.userId);

  const user=req.user
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

    const isSlotAvailable = getSlotAvailability(paraExpertId, date, startTime, endTime);

    if (!isSlotAvailable) {
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

    const createNotification =  notification(
      paraExpertId,
      appointment._id, 
      image
    )

    if(!createNotification){
      throw new ApiError(ResponseStatusCode.BAD_REQUEST, "Failed to send notification");
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
        const slots: String[] = await getAvailableSlots(paraExpertId, loop);

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
  getBookings,
  getParaExpertTimeSlot,
  getParaExpertAvailability,
};
