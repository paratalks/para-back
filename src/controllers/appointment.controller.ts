import type { Request, Response } from "express";
import { ApiError } from "../util/apiError";
import { asyncHandler } from "../util/asyncHandler";
import { ApiResponse } from "../util/apiResponse";
import { Appointments } from "../models/appointments/appointments.model";
import { getAvailableSlots } from "../util/paraexpert.util";
import { ResponseStatusCode } from "../constants/constants";
import { getSlotAvailability } from "../util/paraexpert.util";
import type { ObjectId } from "mongoose";
import { fcm, notification, sendNotif } from "../util/notification.util";
import { ParaExpert } from "../models/paraExpert/paraExpert.model";
import { generateRtcToken } from "../util/token.util";
import { User } from "../models/user/user.model";
import { title } from "node:process";

interface Query {
  userId: ObjectId;
  status?: string;
}

//user
const bookAppointment = asyncHandler(async (req: Request, res: Response) => {
  const { startTime, endTime, status, image, amount, appointmentMode,appointmentMethod, problem } =
    req.body as {
      startTime: string;
      endTime: string;
      status: string;
      image: string;
      amount: number;
      appointmentMode: string;
      appointmentMethod: string;
      problem: string[];
    };

  const date = new Date(req.body.date);

  const user = req.user;
  const userId = user._id;
  if (!userId) {
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
      !appointmentMode ||
      !appointmentMethod ||
      !problem
    ) {
      throw new ApiError(
        ResponseStatusCode.BAD_REQUEST,
        "All fields are required"
      );
    }
    const isSlotAvailable = await getSlotAvailability(
      paraExpertId,
      date,
      startTime,
      endTime,
      appointmentMethod
    );
    console.log("value",isSlotAvailable)

    if (!isSlotAvailable) {
      throw new ApiError(
        ResponseStatusCode.BAD_REQUEST,
        "Availability not found for the given date"
      );
    }

    const callToken = generateRtcToken();

    if (!callToken) {
      throw new ApiError(
        ResponseStatusCode.BAD_REQUEST,
        "Failed to create token"
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
      appointmentMethod,
      callToken,
      problem,
    });

    if (!appointment) {
      throw new ApiError(
        ResponseStatusCode.BAD_REQUEST,
        "Failed to create appointment"
      );
    }

    const bookingUser = await User.findById(userId)
    console.log("bokking",bookingUser)

    // await sendNotif(
    //   bookingUser.fcmToken,
    //   "Booking confirmed",
    //   `Appointment booked for ${date} from ${startTime} to ${endTime}`
    // );

    const createNotification = await notification(userId,"Booking confirmed",`Appointment booked for ${date} from ${startTime} to ${endTime}`,"appointment",appointment._id);
    console.log("createNotification",createNotification)

    if (!createNotification) {
      throw new ApiError(
        ResponseStatusCode.BAD_REQUEST,
        "Failed to create notification"
      );
    }

    const sendNotification = fcm(createNotification._id);
    console.log("sendNotification",sendNotification)

    if (!sendNotification) {
      throw new ApiError(
        ResponseStatusCode.BAD_REQUEST,
        "Failed to send notification"
      );
    }
    const paraExpert = await ParaExpert.findById(paraExpertId);
    console.log("paraExpert",paraExpert)
    if (!paraExpert) {
      throw new ApiError(
        ResponseStatusCode.BAD_REQUEST,
        "Para expert not found"
      );
    }
     const paraExpertUser = await User.findById(paraExpert.userId);
      console.log("paraExpertUser",paraExpertUser)
     if (!paraExpertUser || !paraExpertUser.fcmToken) {
       throw new ApiError(
         ResponseStatusCode.BAD_REQUEST,
         "FCM token not found for para expert user"
       );
     }
     
    // await sendNotif(
    //   paraExpertUser.fcmToken,
    //   "New booking request",
    //   `You have a new appointment request for ${date} from ${startTime} to ${endTime}`
    // );

    const createParaExpertNotification = await notification(
      paraExpert.userId,
      "New booking request",
      `You have a new appointment request for ${date} from ${startTime} to ${endTime}`,
      "appointment",
      appointment._id
    );

    if (!createParaExpertNotification) {
      throw new ApiError(
        ResponseStatusCode.BAD_REQUEST,
        "Failed to create notification for para expert"
      );
    }

    // const sendParaExpertNotification = fcm(createParaExpertNotification._id);

    // if (!sendParaExpertNotification) {
    //   throw new ApiError(
    //     ResponseStatusCode.BAD_REQUEST,
    //     "Failed to send notification to para expert"
    //   );
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
      console.log("user", user);
      const userId = user._id;
      const { status }: { status?: string } = req.query;
      const queryObj: Query = { userId };
      status && queryObj.status === status;

      const appointment = await Appointments.find(queryObj);

      const result = await Promise.all( appointment.map(async(item)=>{
        const expert = await ParaExpert.findById(item.paraExpertId)
        const paraUser = await User.findById(expert.userId)
        return{appointment:item, paraExpertName:paraUser.name, paraExpert:expert}
      }))

      return res.json(
        new ApiResponse(
          ResponseStatusCode.SUCCESS,
          result,
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

const getParaExpertAvailability = async (req: Request, res: Response) => {
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
    // const endDateObj = new Date(endDate as string);

    const paraExpert = await ParaExpert.findById(paraExpertId);

    if (!paraExpert) {
      return res.json(
        new ApiResponse(
          ResponseStatusCode.NOT_FOUND,
          "ParaExpert not found"
        )
      );
    }
    const bookings = await Appointments.find({
      paraExpertId: paraExpertId,
      date: startDateObj, 
      status: 'scheduled'
    }).select('startTime endTime');

    const bookedSlots = bookings.map(appointment => ({
      _id: appointment._id,
      startTime: appointment.startTime,
      endTime: appointment.endTime
    }));
    
    bookedSlots.sort((a, b) => {
      if (a.startTime < b.startTime) return -1;
      if (a.startTime > b.startTime) return 1;
      return 0;
    });
    
    const uniqueTimes = [...new Set(bookedSlots.flatMap(slot => [slot.startTime, slot.endTime]))];
    
    // Sorting uniqueTimes chronologically
    const bookedUniqueTimes =uniqueTimes.sort();
    const availableSlots = [
      "06:00", "07:00", "08:00", "09:00", "10:00",
      "11:00", "12:00", "13:00", "14:00", "15:00",
      "16:00", "17:00", "18:00"
  ];
  
    const availableSlotsFiltered = availableSlots.filter(slot => !bookedUniqueTimes.includes(slot));


    const response = {
      availability: {
        date: startDate,
        slots: {
        chat: [...availableSlotsFiltered],
        video_call: [...availableSlotsFiltered],
        audio_call: [...availableSlotsFiltered]
        }
        
      },
    consultancy: {
        audio_call_price: paraExpert.consultancy.audio_call_price,
        video_call_price: paraExpert.consultancy.video_call_price,
        messaging_price: paraExpert.consultancy.messaging_price,
      },
    };

    res.json(new ApiResponse(ResponseStatusCode.SUCCESS, response));
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(ResponseStatusCode.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to fetch availability',
    });
  }
};

//paraexpert
const getBookings = asyncHandler(async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const userId = user._id;
    const paraExpert = await ParaExpert.findOne({ userId });
    const paraExpertId = paraExpert._id;
    const appointments = await Appointments.find({ paraExpertId })
    .select('-createdAt -updatedAt -__v') 
    .populate({
      path: 'userId',
      model:'User',
      select: 'name profilePicture'
    })

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

const updateAppointment = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id, status, startTime, endTime, appointmentMode, problem, reason } = req.body;

    const date = new Date(req.body.date);

    const appointment = await Appointments.findByIdAndUpdate(
      id,
      { $set: { date, startTime, endTime, status, appointmentMode, problem, reason } },
      { new: true }
    );

    if(!appointment){
      throw new ApiError(
        ResponseStatusCode.BAD_REQUEST,
        "Appointment not found"
      );
    }

    const bookingUser = await User.findById(appointment.userId);

    await sendNotif(
      bookingUser.fcmToken,
      "Appointment updated successfully",
      `Appointment ${status}`
    );
    

    const createNotification = await notification(
      appointment.userId,
      "Appointment updated successfully",
      `Appointment ${status}`,
      "appointment",
      appointment._id
    );

    if (!createNotification) {
      throw new ApiError(
        ResponseStatusCode.BAD_REQUEST,
        "Failed to create notification"
      );
    }

    const sendNotification = fcm(createNotification._id)

    if (!sendNotification) {
      throw new ApiError(
        ResponseStatusCode.BAD_REQUEST,
        "Failed to send notification"
      );
    }

    return res.json(
      new ApiResponse(
        ResponseStatusCode.SUCCESS,
        appointment,
        "Appointment updates successfully"
      )
    );
  } catch (error) {
    throw new ApiError(
      ResponseStatusCode.INTERNAL_SERVER_ERROR,
      error.message || "Internal server error"
    );
  }
});

const getAppointmentById = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const appointment = await Appointments.findById(id);
    const paraExpert = await ParaExpert.findById(appointment.paraExpertId);
    const paraUser = await User.findById(paraExpert.userId);
    const user = await User.findById(appointment.userId)
    return res.json(
      new ApiResponse(
        ResponseStatusCode.SUCCESS,
        { appointment, paraExpertName:paraUser.name, paraExpert, user },
        "Appointment fetched successfully"
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
  updateAppointment,
  getAppointmentById,
};
