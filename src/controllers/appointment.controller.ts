import { Request, Response } from "express";
import { apiError } from "../util/apiError";
import { asyncHandler } from "../util/asyncHandler";
import { apiResponse } from "../util/apiResponse";
import { appointments } from "../models/appointments/appointments.model";
import { paraExpert } from "../models/paraExpert/paraExpert.model";
import { ObjectId } from "mongoose";

const bookAppointment = asyncHandler(async (req: Request, res: Response) => {
  const { date, startTime, endTime, status } = req.body as {
    date: Date;
    startTime: string;
    endTime: string;
    status: string;
  };

  const { userId } = req.params;
  const { paraExpertId } = req.query;

  if (!userId || !paraExpertId || !date || !startTime || !endTime || !status) {
    throw new apiError(400, "All fields are required");
  }

  const expert = await paraExpert.findById(paraExpertId);

  if (!expert) {
    throw new apiError(404, "ParaExpert not found");
  }

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

  const appointment = await appointments.create({
    userId,
    paraExpertId,
    date,
    startTime,
    endTime,
    status,
  });

  if (!appointment) {
    throw new apiError(400, "Failed to create appointment");
  }

  return res.status(200).json(
    new apiResponse(200, appointment, "Appointment created successfully")
  );
});

const getBookedAppointment = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    let query = appointments.find({userId});;
    const {status} = req.query;

    if(status){
        query = query.find({status:status});
    }

    const appointment = await query.exec();

    return res
      .status(200)
      .json(
        new apiResponse(200, appointment, "Appointmnet created successfully")
      );
  }
);


export { bookAppointment, getBookedAppointment };