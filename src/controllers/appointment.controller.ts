import type { Request, Response } from "express";
import { ApiError } from "../util/apiError";
import { asyncHandler } from "../util/asyncHandler";
import { ApiResponse } from "../util/apiResponse";
import { Appointments } from "../models/appointments/appointments.model";
import { ResponseStatusCode } from "../constants/constants";
import { getSlotAvailability } from "../util/paraexpert.util";
import { fcm, notification, sendNotif } from "../util/notification.util";
import { ParaExpert } from "../models/paraExpert/paraExpert.model";
import { generateRtcToken } from "../util/token.util";
import { User } from "../models/user/user.model";
import { title } from "node:process";

interface Query {
  userId: string;
  status?: { $in: string[] } | string;
}

//user
const bookAppointment = asyncHandler(async (req: Request, res: Response) => {
  const {
    startTime,
    endTime,
    status,
    image,
    amount,
    appointmentMode,
    appointmentMethod,
    problem,
  } = req.body as {
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
    console.log("value", isSlotAvailable);

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

    const bookingUser = await User.findById(userId);

    await sendNotif(
      bookingUser.fcmToken,
      "Booking Placed",
      `Your appointment request has been received for ${date} from ${startTime} to ${endTime}.`,
      appointment._id
    );

    const createNotification = await notification(
      userId,
      "Booking Placed",
      `Your appointment request has been received for ${date} from ${startTime} to ${endTime}.`,
      "appointment",
      appointment._id
    );

    if (!createNotification) {
      throw new ApiError(
        ResponseStatusCode.BAD_REQUEST,
        "Failed to create notification"
      );
    }

    const paraExpert = await ParaExpert.findById(paraExpertId);
    if (!paraExpert) {
      throw new ApiError(
        ResponseStatusCode.BAD_REQUEST,
        "Para expert not found"
      );
    }
    const paraExpertUser = await User.findById(paraExpert.userId);
    if (!paraExpertUser) {
      throw new ApiError(
        ResponseStatusCode.BAD_REQUEST,
        "FCM token not found for para expert user"
      );
    }

    await sendNotif(
      paraExpertUser.fcmToken,
      "New Booking Request",
      `You have a new appointment request for ${date} from ${startTime} to ${endTime}.`,
      appointment?._id
    );

    const createParaExpertNotification = await notification(
      paraExpertUser._id,
      "New booking request",
      `You have a new appointment request for ${date} from ${startTime} to ${endTime}`,
      "appointment",
      appointment._id,
      bookingUser?.profilePicture
    );
    if (!createParaExpertNotification) {
      throw new ApiError(
        ResponseStatusCode.BAD_REQUEST,
        "Failed to create notification"
      );
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
      const user = req.user;
      const userId = user._id.toString();
      const { status }: { status?: string } = req.query;

      let queryObj: Query = { userId };

      if (status) {
        if (status === "confirmed") {
          queryObj.status = { $in: ["confirmed", "rescheduled","ongoing"] };
        }
        else {
          queryObj.status = status;
        }
      }

      const appointment = await Appointments.find(queryObj)
        .select("-reason -problem -createdAt -updatedAt -__v")
        .populate([
          {
            path: "paraExpertId",
            model: "ParaExpert",
            select: "userId basedOn _id",
            populate: [
              {
                path: "userId",
                model: "User",
                select: "name profilePicture",
              },
            ],
          },
        ])
        .exec();

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

//user
const getAppointmentById = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const appointment = await Appointments.findById(bookingId)
      .select("-createdAt -updatedAt -__v")
      .populate([
        {
          path: "paraExpertId",
          model: "ParaExpert",
          select: "userId basedOn _id",
          populate: [
            {
              path: "userId",
              model: "User",
              select: "name profilePicture",
            },
          ],
        },
      ])
      .exec();

    if (!appointment) {
      return res.json(
        new ApiResponse(
          ResponseStatusCode.NOT_FOUND,
          {},
          "Appointment not found"
        )
      );
    }
    return res.json(
      new ApiResponse(
        ResponseStatusCode.SUCCESS,
        { appointment },
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

    const day = startDateObj.getUTCDay(); // Get the day of the week (0-6)

    const paraExpert = await ParaExpert.findById(paraExpertId);

    if (!paraExpert) {
      return res.json(
        new ApiResponse(ResponseStatusCode.NOT_FOUND, "ParaExpert not found")
      );
    }

    const availabilityForDay = paraExpert.availability.find(
      (a) => a.day === day
    );

    if (!availabilityForDay) {
      return res.json(
        new ApiResponse(
          ResponseStatusCode.NOT_FOUND,
          "No availability for the selected day"
        )
      );
    }

    const bookings = await Appointments.find({
      paraExpertId: paraExpertId,
      date: startDateObj,
      status: { $in: ["confirmed", "rescheduled"] },
    }).select("startTime endTime");

    const bookedSlots = bookings.flatMap((appointment) => {
      return [
        { type: "chat", time: appointment.startTime },
        { type: "chat", time: appointment.endTime },
        { type: "video_call", time: appointment.startTime },
        { type: "video_call", time: appointment.endTime },
        { type: "audio_call", time: appointment.startTime },
        { type: "audio_call", time: appointment.endTime },
      ];
    });

    const filterAvailableSlots = (
      type: "chat" | "video_call" | "audio_call"
    ) => {
      const availableSlots = availabilityForDay.slots[type];
      return availableSlots.filter(
        (slot) => !bookedSlots.some((b) => b.type === type && b.time === slot)
      );
    };

    const response = {
      availability: {
        date: startDate,
        slots: {
          chat: filterAvailableSlots("chat"),
          video_call: filterAvailableSlots("video_call"),
          audio_call: filterAvailableSlots("audio_call"),
        },
      },
      consultancy: {
        audio_call_price: paraExpert.consultancy.audio_call_price,
        video_call_price: paraExpert.consultancy.video_call_price,
        messaging_price: paraExpert.consultancy.messaging_price,
      },
    };

    res.json(new ApiResponse(ResponseStatusCode.SUCCESS, response));
  } catch (error) {
    console.error("Error fetching availability:", error);
    res.status(ResponseStatusCode.INTERNAL_SERVER_ERROR).json({
      error: "Failed to fetch availability",
    });
  }
};

//paraexpert
const getParaExpertsBookings = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const user = req.user;
      const userId = user._id;
      if (!userId) {
        throw new ApiError(
          ResponseStatusCode.UNAUTHORIZED,
          "Invalid refresh token"
        );
      }
      
      const { status } = req.query;

      const queryObj: { status?: any } = {};

      if (status) {
        if (status === "confirmed") {
          queryObj.status = { $in: ["confirmed", "rescheduled", "ongoing"] };
        } else {
          queryObj.status = status;
        }
      }

      const paraExpert = await ParaExpert.findOne({ userId });
      if (!paraExpert) {
        throw new ApiError(ResponseStatusCode.NOT_FOUND, "ParaExpert not found");
      }

      const paraExpertId = paraExpert._id;

      const appointments = await Appointments.find({
        paraExpertId,
        ...queryObj
      }).select("-problem -paraExpertId -reason -createdAt -updatedAt -__v")
        .populate({
          path: "userId",
          model: "User",
          select: "name profilePicture",
        })
        .exec();

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
  }
);

//paraexpert
const getBookingById = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const appointment = await Appointments.findById(bookingId)
      .select("-paraExpertId -createdAt -updatedAt -__v")
      .populate({
        path: "userId",
        model: "User",
        select: "name profilePicture",
      })
      .exec();

    if (!appointment) {
      return res.json(
        new ApiResponse(
          ResponseStatusCode.NOT_FOUND,
          {},
          "Appointment not found"
        )
      );
    }
    return res.json(
      new ApiResponse(
        ResponseStatusCode.SUCCESS,
        { appointment },
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

//user while reschduled time
const updateAppointment = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const {
      status,
      startTime,
      endTime,
      appointmentMode,
      appointmentMethod,
      problem,
      reason,
    } = req.body;

    const date = new Date(req.body.date);

    const appointment = await Appointments.findByIdAndUpdate(
      bookingId,
      {
        $set: {
          date,
          startTime,
          endTime,
          status,
          appointmentMode,
          appointmentMethod,
          problem,
          reason,
        },
      },
      { new: true }
    );

    if (!appointment) {
      throw new ApiError(
        ResponseStatusCode.BAD_REQUEST,
        "Appointment not found"
      );
    }

    const bookingUser = await User.findById(appointment.userId);

    await sendNotif(
      bookingUser.fcmToken,
      "Appointment updated successfully",
      `Appointment ${status}`,
      appointment?._id
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

    // const sendNotification = fcm(createNotification._id)

    // if (!sendNotification) {
    //   throw new ApiError(
    //     ResponseStatusCode.BAD_REQUEST,
    //     "Failed to send notification"
    //   );
    // }

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

//user while Confirm and ongoing  cancelled and completed time
type BookingStatus = "completed" | "confirmed" | "cancelled" | "ongoing";

const updateAppointmentStatus = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { bookingId } = req.params;
      const { status } = req.query;

      if (!status) {
        throw new ApiError(
          ResponseStatusCode.BAD_REQUEST,
          "Status is required"
        );
      }

      const booking = await Appointments.findById(bookingId);
      if (!booking) {
        throw new ApiError(ResponseStatusCode.NOT_FOUND, "Booking not found");
      }

      booking.status = status as BookingStatus;
      const appointment = await booking.save();

      const bookingUser = await User.findById(appointment?.userId);
      const paraExpert = await ParaExpert.findById(appointment?.paraExpertId);
      if (!paraExpert) {
        throw new ApiError(
          ResponseStatusCode.BAD_REQUEST,
          "Para expert not found"
        );
      }
      const paraExpertUser = await User.findById(paraExpert.userId);
      if (!paraExpertUser) {
        throw new ApiError(
          ResponseStatusCode.BAD_REQUEST,
          "FCM token not found for para expert user"
        );
      }
      const date = appointment?.date.toISOString().split("T")[0];
      const startTime = appointment?.startTime;
      const endTime = appointment?.endTime;
      const appointmentMethod = appointment?.appointmentMethod;

      const statusMessages: Record<BookingStatus, { title: string, message: string, paraExpertMessage: string, paraExpertTitle: string }> = {
        confirmed: {
          title: "Booking Confirmed",
          message: `Your ${appointmentMethod} appointment is confirmed for ${date} from ${startTime} to ${endTime}.`,
          paraExpertMessage: `You have an  appointment scheduled for ${date} from ${startTime} to ${endTime}.`,
          paraExpertTitle: "Appointment Scheduled"
        },
        cancelled: {
          title: "Booking Cancelled",
          message: `Your ${appointmentMethod} appointment for ${date} from ${startTime} to ${endTime} has been cancelled.`,
          paraExpertMessage: `The appointment scheduled for ${date} from ${startTime} to ${endTime} has been cancelled.`,
          paraExpertTitle: "Appointment Cancelled"
        },
        completed: {
          title: "Appointment Completed",
          message: `our ${appointmentMethod} appointment on ${date} from ${startTime} to ${endTime} has been completed`,
          paraExpertMessage: "Appointment Completed",
          paraExpertTitle: `our ${appointmentMethod} appointment with the user on ${date} from ${startTime} to ${endTime} has been completed`
        },
        ongoing: {
          title: "Call Started",
          message: `Your ${appointmentMethod} call with the para expert has just started.`,
          paraExpertMessage: `You have started the ${appointmentMethod} call with the user.`,
          paraExpertTitle: "Call in Progress"
        }
      };

      const { title, message, paraExpertMessage, paraExpertTitle } = statusMessages[status as BookingStatus];


      // Notify the user
      await sendNotif(
        bookingUser.fcmToken,
        title,
        message,
        appointment._id
      );

      await notification(
        bookingUser._id,
        title,
        message,
        "appointment",
        appointment._id,
        paraExpertUser.profilePicture
      );

      await sendNotif(
        paraExpertUser.fcmToken,
        paraExpertTitle,
        paraExpertMessage,
        appointment._id
      );

      await notification(
        paraExpertUser._id,
        paraExpertTitle,
        paraExpertMessage,
        "appointment",
        appointment._id,
        bookingUser.profilePicture
      );

      res.json(
        new ApiResponse(
          ResponseStatusCode.SUCCESS,
          booking,
          "Booking status updated successfully"
        )
      );
    } catch (error) {
      res
        .status(error.statusCode || 500)
        .json(
          new ApiError(
            error.statusCode || ResponseStatusCode.INTERNAL_SERVER_ERROR,
            error.message || "Internal server error"
          )
        );
    }
  }
);

export {
  bookAppointment,
  getBookingById,
  getBookedAppointment,
  getParaExpertsBookings,
  getParaExpertAvailability,
  updateAppointment,
  getAppointmentById,
  updateAppointmentStatus,
};
