import type { Request, Response } from "express";
import { ApiError } from "../util/apiError";
import { asyncHandler } from "../util/asyncHandler";
import { ApiResponse } from "../util/apiResponse";
import { Appointments } from "../models/appointments/appointments.model";
import { ParaExpert } from "../models/paraExpert/paraExpert.model";
import { User } from "../models/user/user.model";
import jwt from "jsonwebtoken";
import { getAvailability } from "../util/getAvailability";
import { Notifications } from "../models/notification/notification.model";
import type { ObjectId } from "mongoose";


//user
const bookAppointment = asyncHandler(async (req: Request, res: Response) => {
  const { date, startTime, endTime, status,title,description,referrer,referrerId,image } = req.body as {
    date: string;
    startTime: string;
    endTime: string;
    status: string;
    title:string, //constant
    description:string, //particular time vagerah jab book hua
    referrer:string, //appointment
    referrerId: ObjectId,  // appointmentId
    image:string// paraImage
  };

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

    //function in utility for anywhere we want to book
    const notification =  await Notifications.create({
      title,
      description,
      referrer,
      referrerId, 
      image
    })


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
      const { status } = req.query;

      const query = Appointments.find({userId, ...(status && {status})})
      const appointment = await query.exec()
     
      return res
        .json(
          new ApiResponse(200, appointment, "Appointmnet fetched successfully")
        );
    } catch (error) {
      throw new ApiError(401,error?.message || "Failure in appointment fetching")
    }
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
    } catch (error) {
      throw new ApiError(401, error?.message || "Error in fetching availability")
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
  } catch (error) {
    throw new ApiError(400,error?.message || "Failure in updation");

  }
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
  } catch (error) {
    throw new ApiError(400,error?.message || "Failure in appointment fetching");

  }
});

export {
  bookAppointment,
  getBookedAppointment,
  setAvailability,
  getBookings,
  getParaExpertAvailability,
};
