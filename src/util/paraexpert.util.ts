import { ParaExpert } from "../models/paraExpert/paraExpert.model";
import { ApiError } from "./apiError";
import { Appointments } from "../models/appointments/appointments.model";
import { ObjectId } from "mongoose";
import { Review } from "../models/reviews/review.model";
import { User } from "../models/user/user.model";
import { BookingType } from ".";

export const getAvailableSlots = async (paraExpertId: any, date: Date, appointmentMode: string) => {
  const paraExpert = await ParaExpert.findById(paraExpertId);

  if (!paraExpert) {
    throw new ApiError(400, "ParaExpert not found");
  }

  const day: number = date.getDay();
  const availables = paraExpert.availability.find((item) => item.day === day);
  const available_modes = availables?.slots;
  let available_slots;

  switch (appointmentMode) {
    case BookingType.CHAT:
      available_slots = available_modes.chat;
      break;
    case BookingType.VIDEO_CALL:
      available_slots = available_modes.video_call;
      break;
    case BookingType.AUDIO_CALL:
      available_slots = available_modes.audio_call;
      break;
    default:
      throw new ApiError(400, "Invalid appointment mode");
  }

  if (available_slots) {
    const appointments = await Appointments.find({
      paraExpertId,
      date: {
        $gte: new Date(new Date(date).setHours(0, 0, 0)),
        $lte: new Date(new Date(date).setHours(23, 59, 59)),
      },
    });

    const slots: String[] = available_slots.filter(
      (slot) =>
        !appointments.some(
          (appointment: { startTime: String }) =>
            appointment.startTime === slot?.split("-")[0]
        )
    );

    return Promise.resolve(slots);
  }
  return;
};


export const getSlotAvailability = async (
  paraExpertId: any,
  date: Date,
  startTime: string,
  endTime: string,
  appointmentMode : string
) => {
  const availability: String[] = await getAvailableSlots(paraExpertId, date, appointmentMode);
  const slots = availability?.find(
    (slot) => slot.split("-")[0] === startTime //&& slot.split("-")[1] === endTime
  );
  if (slots) {
    return true;
  } else {
    return false;
  }
};

export const getReviews = async (paraExpertId:ObjectId) => {
    try {
      const reviews = await Review.find({ paraExpertId });
      const result: {
        id: ObjectId;
        name: String;
        rating: Number;
        review: String;
      }[] = await Promise.all(
        reviews.map(async (review) => {
          const user = await User.findById(review.userId);
          return {
            id: review._id,
            name: user.name,
            rating: review.rating,
            review: review.review,
          };
        })
      );
      if (!reviews) {
        return 
      }
      return result;
    } catch (error) {
      return 
    }
  };