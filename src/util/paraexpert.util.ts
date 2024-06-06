import { ParaExpert } from "../models/paraExpert/paraExpert.model";
import { ApiError } from "./apiError";
import { Appointments } from "../models/appointments/appointments.model";

export const getAvailableSlots = async (paraExpertId: any, date: Date) => {
  const paraExpert = await ParaExpert.findById(paraExpertId);

  if (!paraExpert) {
    throw new ApiError(400, "ParaExpert not found");
  }

  const day: number = date.getDay();
  const availables = paraExpert.availability.find((item) => item.day === day);
  const available_slots = availables?.slots;

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
  endTime: string
) => {
  const availability: String[] = await getAvailableSlots(paraExpertId, date);
  const slots = availability?.find(
    (slot) => slot.split("-")[0] === startTime //&& slot.split("-")[1] === endTime
  );
  if (slots) {
    return true;
  } else {
    return false;
  }
};