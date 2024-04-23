import { Request, Response } from "express";
import { ApiError } from "../util/apiError";
import { asyncHandler } from "../util/asyncHandler";
import { ApiResponse } from "../util/apiResponse";
import { Appointments } from "../models/appointments/appointments.model";
import { ParaExpert } from "../models/paraExpert/paraExpert.model";
import {User} from "../models/user/user.model";
import { ObjectId } from "mongoose";
import jwt from "jsonwebtoken";

const bookAppointment = asyncHandler(async (req: Request, res: Response) => {
  const { date, startTime, endTime, status } = req.body as {
    date: string,
    startTime: string,
    endTime: string,
    status: string,
  };
  console.log(req.body)

  const incomingToken =  req.cookies.token || req.body.token

  try {
    if (!incomingToken) {
      throw new ApiError(401, "unauthorized request");
    }

    const decodedToken: any = jwt.verify(incomingToken, process.env.JWT_SECRET);

    const user = await User.findById(decodedToken?.userId);
    const userId = user._id;
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    //const { userId } = req.params;
    const { paraExpertId } = req.params;

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

    const expert = await ParaExpert.findById(paraExpertId);

    if (!expert) {
      throw new ApiError(404, "ParaExpert not found");
    }

    const bookedSlot = await Appointments.findOne({
      paraExpertId,
      userId,
      date,
      startTime,
    });

    if (bookedSlot) {
      throw new ApiError(400, "Slot already booked.");
    }

    //---------------------------------------

    // const dayAvailability = expert.availability.find((item) => item.day === date.toString());

    // if (!dayAvailability) {
    //   throw new apiError(400, "Availability not found for the given date");
    // }

    // const slotIndex = dayAvailability.slots.findIndex(slot => slot.startTime === startTime && slot.endTime === endTime && slot.booked === false);

    // if (slotIndex === -1) {
    //   throw new apiError(400, "Slot not found for the given time");
    // }

    // if (dayAvailability.slots[slotIndex].booked) {
    //   throw new apiError(400, "Slot is already booked");
    // }

    // // Update availability
    // dayAvailability.slots[slotIndex].booked = true;

    // await expert.save();

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
      .status(200)
      .json(
        new ApiResponse(200, appointment, "Appointment created successfully")
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }

});

const getBookedAppointment = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    let query = Appointments.find({userId});;
    const {status} = req.query;

    if(status){
        query = query.find({status:status});
    }

    const appointment = await query.exec();

    return res
      .status(200)
      .json(
        new ApiResponse(200, appointment, "Appointmnet fetched successfully")
      );
  }
);


export { bookAppointment, getBookedAppointment };