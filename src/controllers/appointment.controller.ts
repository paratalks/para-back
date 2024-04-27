import { Request, Response, query } from "express";
import { apiError } from "../util/apiError";
import { asyncHandler } from "../util/asyncHandler";
import { apiResponse } from "../util/apiResponse";
import { Appointments } from "../models/appointments/appointments.model";
import { ParaExpert } from "../models/paraExpert/paraExpert.model";
import { ObjectId } from "mongoose";
import { object } from "zod";

interface Slot {
  startTime: string;
  endTime: string;
}

interface BookedSlots {
  [key: string]: Slot[];
}

const weekday = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

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

  const expert = await ParaExpert.findById(paraExpertId);

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

  const appointment = await Appointments.create({
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

  return res
    .status(200)
    .json(
      new apiResponse(200, appointment, "Appointment created successfully")
    );
});

const getBookedAppointment = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    let query = Appointments.find({ userId });
    const { status } = req.query;

    if (status) {
      query = query.find({ status: status });
    }

    const appointment = await query.exec();

    return res
      .status(200)
      .json(
        new apiResponse(200, appointment, "Appointmnet created successfully")
      );
  }
);

//on Friday non-reviewed by myself
const getParaExpertTimeSlot = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { paraExpertId } = req.params;

      const appointment = Appointments.find({ paraExpertId });
    } catch (error) {}
  }
);

const getParaExpertAvailability = asyncHandler(
  // test in postman
  async (req: Request, res: Response) => {
    try {
      const { paraExpertId, startDate, endDate } = req.query;

      if (!paraExpertId || !startDate || !endDate) {
        return res.status(400).json({ error: "Missing required parameters" });
      }

      const startDateObj = new Date(startDate as string);
      const endDateObj = new Date(endDate as string);

      const paraExpert = await ParaExpert.findById({ paraExpertId });

      if (!paraExpert) {
        return res.status(400).json({ error: "Missing required parameters" });
      }

      const appointments = await Appointments.find({
        paraExpertId,
        date: {
          $gte: startDateObj,
          $lte: endDateObj,
        },
      });

      const bookedSlots: BookedSlots = appointments.reduce(
        (acc: BookedSlots, appointment) => {
          const { date, startTime, endTime } = appointment;
          const formattedDate = date.toISOString().split("T")[0];
          const dayOfWeek = weekday[date.getDay()];

          acc[dayOfWeek] = acc[dayOfWeek] || [];
          acc[dayOfWeek].push({ startTime, endTime });

          //acc[formattedDate] = acc[formattedDate] || [];
          //acc[formattedDate].push({ startTime, endTime });

          return acc;
        },
        {}
      );

      const availableSlots = paraExpert.availability.reduce(
        (acc: { [key: string]: string[] }, availability) => {
          const { day, slots } = availability;

          //@ts-ignore
          const bookedSlotsForDay = bookedSlots[day] || [];
          const availableSlotsForDay = slots.filter(
            (slot) =>
              !bookedSlotsForDay.some(
                (bookedSlot: { startTime: String; }) => bookedSlot.startTime === slot
              )
          );

          if (availableSlotsForDay.length > 0) {
            //@ts-ignore
            acc[day] = availableSlotsForDay;
          }

          return acc;
        },
        {}
      );

      res.status(200).json({ availableSlots });
    } catch (error) {}
  }
);

export { bookAppointment, getBookedAppointment, getParaExpertAvailability };
