import { User } from "../models/user/user.model";
import { ParaExpert } from "../models/paraExpert/paraExpert.model";
import { Appointments } from "../models/appointments/appointments.model";
import { Notifications } from "../models/notification/notification.model";
import { ObjectId } from "mongoose";
const PushNotifications = require("@pusher/push-notifications-server");

export const notification = async (
  paraExpertId: string,
  appointmentId: string,
  image: string
) => {
  try {
    const paraExpert = await ParaExpert.findById(paraExpertId);
    const user = await User.findById(paraExpert.userId);
    const appointment = await Appointments.findById(appointmentId);
    const title = `Appointment successfully booked with ${user.name}`;
    const description = `Appointment booked for ${appointment.date} from ${appointment.startTime} to ${appointment.endTime}`;
    const referrer = "appointment";
    const referrerId = appointmentId;

    const createNotification = await Notifications.create({
      title,
      description,
      referrer,
      referrerId,
      image,
    });

    return createNotification;
  } catch (error) {
    return;
  }
};

export const setFcm = async (userId: ObjectId, data?: string) => {
  try {
    const user = await User.findById(userId);
    const fcm = {
      notification: {
        title: `Appointment successfully booked with ${user.name}`,
        body: `Appointment booked for ${user.dateOfBirth} from ${user.gender}`,
      },
      data,
    };
    const updatedUser = await User.findByIdAndUpdate(user._id, {
      fcm,
    });

    return updatedUser;
  } catch (error) {
    return;
  }
};

export const fcm = ()=>{
  let beamsClient = new PushNotifications({
    instanceId: "YOUR_INSTANCE_ID_HERE",
    secretKey: "YOUR_SECRET_KEY_HERE",
  });

  beamsClient
    .publish(["hello"], {
      fcm: {
        notification: {
          title: "Hello",
          body: "Hello, world!",
        },
      },
    })
    .then((publishResponse) => {
      return publishResponse.publishId;
    })
    .catch((error) => {
      return;
    });
}
