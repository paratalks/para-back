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
import { notification, setFcm } from "../util/notification.util";
import axios from "axios";
import { ParaExpert } from "../models/paraExpert/paraExpert.model";

interface Query {
  userId: ObjectId;
  status?: string;
}

//user
const bookAppointment = asyncHandler(async (req: Request, res: Response) => {
  const { startTime, endTime, status,image, amount, appointmentMode } = req.body as {
    startTime: string;
    endTime: string;
    status: string;
    image:string;
    amount:number;
    appointmentMode:string
  };

  const date = new Date(req.body.date)

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
      !status ||
      !appointmentMode
    ) {
      throw new ApiError(
        ResponseStatusCode.BAD_REQUEST,
        "All fields are required"
      );
    }
    console.log(typeof(date))
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
      appointmentMode,
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

    // const userWithFcm = setFcm(user._id, fcmToken);//add fcm token functionality after connecting it with app

    // if(!userWithFcm){
    //   throw new ApiError(ResponseStatusCode.BAD_REQUEST, "Failed to set FCM");
    // }

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
      const user = req.user;
      console.log("user",user)
      const userId=user._id;
      const { status }:{status?:string} = req.query;
      const queryObj: Query = { userId };
      status && (queryObj.status === status);

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
    const user = req.user;
    const userId=user._id
    const paraExpert=await ParaExpert.findOne({userId})
    const paraExpertId=paraExpert._id
    const appointments = await Appointments.find({ paraExpertId});
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
