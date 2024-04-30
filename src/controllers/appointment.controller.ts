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

const weekday = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

//user
const bookAppointment = asyncHandler(async (req: Request, res: Response) => {
  const { date, startTime, endTime, status } = req.body as {
    date: string;
    startTime: string;
    endTime: string;
    status: string;
  };
  console.log(req.body);

  // const incomingToken =  req.cookies.token || req.body.token
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

  //const { userId } = req.params;
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

    // const expert = await ParaExpert.findById(paraExpertId);

    // if (!expert) {
    //   throw new ApiError(404, "ParaExpert not found");
    // }
    
    // const bookedSlot = await Appointments.findOne({
    //   paraExpertId,
    //   userId,
    //   date,
    //   startTime,
    // });

    // if (bookedSlot) {
    //   throw new ApiError(400, "Slot already booked.");
    // }

    // const d=new Date(date)
    // const day: number = d.getDay();

    // const availablility = expert.availability.find((item)=>item.day===day)
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
      .status(200)
      .json(
        new ApiResponse(200, appointment, "Appointment created successfully")
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }

  // const expert = await ParaExpert.findById(paraExpertId);

  // if (!expert) {
  //   throw new ApiError(404, "ParaExpert not found");
  // }

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

  // const appointment = await Appointments.create({
  //   userId,
  //   paraExpertId,
  //   date,
  //   startTime,
  //   endTime,
  //   status,
  // });

  // if (!appointment) {
  //   throw new ApiError(400, "Failed to create appointment");
  // }

  // return res
  //   .status(200)
  //   .json(
  //     new ApiResponse(200, appointment, "Appointment created successfully")
  //   );
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
        .status(200)
        .json(
          new ApiResponse(200, appointment, "Appointmnet fetched successfully")
        );
    } catch (error) {}
  }
);

//paraexpert
//on Friday non-reviewed by myself
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
  // test in postman
  async (req: Request, res: Response) => {
    try {
      const { paraExpertId, startDate, endDate } = req.query;

      if (!paraExpertId || !startDate || !endDate) {
        return res.status(400).json({ error: "Missing required parameters" });
      }

      const startDateObj = new Date(startDate as string);
      const endDateObj = new Date(endDate as string);

      // const paraExpert = await ParaExpert.findById(req.query.paraExpertId);

      // if (!paraExpert) {
      //   return res.status(400).json(new ApiResponse(400, "Missing required parameters") );
      // }

      let availableSlots: { date: string; slots: String[] }[] = [];

      let loop = new Date(startDateObj);
      while (loop <= endDateObj) {
        // const day: number = loop.getDay();

        // const availables = paraExpert.availability.find(
        //   (item) => item.day === day
        // );
        
        // const available_slots = availables?.slots;
        
        // if (available_slots) {
        //   const appointments = await Appointments.find({
        //     paraExpertId,
        //     date: {
        // $gte: new Date(new Date(loop).setHours(0, 0, 0)),
        // $lte: new Date(new Date(loop).setHours(23, 59, 59))
        //  },
        //   });
        //   console.log(paraExpertId)
        //   console.log(appointments)

        //   const slots: String[] = available_slots.filter(
        //     (slot) =>
        //       !appointments.some(
        //         (appointment: { startTime: String }) =>
        //           appointment.startTime === slot?.split("-")[0]
        //       )
        //   );

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

      // const appointments = await Appointments.find({
      //   paraExpertId,
      //   date: {
      //     $gte: startDateObj,
      //     $lte: endDateObj,
      //   },
      // });

      // const bookedSlots: BookedSlots = appointments.reduce(
      //   (acc: BookedSlots, appointment) => {
      //     const { date, startTime, endTime } = appointment;

      //     const dayOfWeek = weekday[date.getDay()];

      //     acc[dayOfWeek] = acc[dayOfWeek] || [];
      //     acc[dayOfWeek].push({ startTime, endTime });
      //     return acc;
      //   },
      //   {}
      // );

      // const availableSlots = paraExpert.availability.reduce(
      //   (acc: { [key: string]: string[] }, availability) => {
      //     const { day, slots } = availability;

      //     //@ts-ignore
      //     const bookedSlotsForDay = bookedSlots[day] || [];
      //     const availableSlotsForDay = slots.filter(
      //       (slot) =>
      //         !bookedSlotsForDay.some(
      //           (bookedSlot: { startTime: String; }) => bookedSlot.startTime === slot.split("-")[0]
      //         )
      //     );

      //     if (availableSlotsForDay.length > 0) {
      //       //@ts-ignore
      //       acc[day] = availableSlotsForDay;
      //     }

      //     return acc;
      //   },
      //   {}
      // );

      res.status(200).json({ availableSlots });
    } catch (error) {}
  }
);

//paraexpert
const setAvailability = asyncHandler(async (req: Request, res: Response) => {
  try {
    // const { paraExpertId } = req.params;

    const { availability } = req.body as {
      availability: [{ day: string; slots: [string] }];
    };

    if (!availability) {
      throw new ApiError(400, "All fields are required");
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
      .status(200)
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
      .status(200)
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
