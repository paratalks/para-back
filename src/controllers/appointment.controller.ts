import { Request, Response } from "express";
import { apiError } from "../util/apiError";
import { asyncHandler } from "../util/asyncHandler";
import { apiResponse } from "../util/apiResponse";
import { appointments } from "../models/appointments/appointments.model";
import { ObjectId } from "mongoose";

const bookAppointment = asyncHandler(async (req: Request, res: Response) => {
  const { userId, paraExpertId, date, startTime, endTime, status } =
    req.body as {
      userId: ObjectId;
      paraExpertId: ObjectId;
      date: Date;
      startTime: string;
      endTime: string;
      status: string;
    };

  if (
    !userId ||
    !paraExpertId ||
    !date ||
    [startTime, endTime, status].some((field) => field?.trim() === "")
  ) {
    throw new apiError(400, "All fields are required");
  }

  const appointment = await appointments.create({
    userId,
    paraExpertId,
    date,
    startTime,
    endTime,
    status,
  });

  const createdAppointment = await appointments.findById(appointment._id);

  if(!createdAppointment) {
    throw new apiError(400, "Something went wrong while creating appointment");
  }

  return res
    .status(200)
    .json(
      new apiResponse(200, appointment, "Appointmnet created successfully")
    );
});

export { bookAppointment };