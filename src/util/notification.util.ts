import { User } from "../models/user/user.model";
import { ParaExpert } from "../models/paraExpert/paraExpert.model";
import { Appointments } from "../models/appointments/appointments.model";
import { Notifications } from "../models/notification/notification.model";
import { ObjectId } from "mongoose";
import { title } from "node:process";
const PushNotifications = require("@pusher/push-notifications-server");

export const notification = async (
  userId:ObjectId,
  title:string,
  description:string,
  referrer: string,
  referrerId: any,
) => {
  try {

    const createNotification = await Notifications.create({
      userId,
      title,
      description,
      referrer,
      referrerId,
    });

    return createNotification;
  } catch (error) {
    return;
  }
};

export const setFcm = async (userId: ObjectId, fcmToken: string) => {
  try {
    const user = await User.findById(userId);
    const fcm = {
      fcmToken,
    };
    const updatedUser = await User.findByIdAndUpdate(user._id, {
      fcm,
    });

    return updatedUser;
  } catch (error) {
    return;
  }
};

export const fcm = async (userId: ObjectId) => {
  try {
    let beamsClient = new PushNotifications({
      instanceId: "PUSHER_INSTANCE_ID",
      secretKey: "PUSHER_SECRET_KEY",
    });

    const notification = await Notifications.findOne(userId)

    beamsClient
      .publish([notification.referrer], {
        fcm: {
          notification: {
            title: notification.title,
            body: notification.description,
          },
        },
      })
      .then((publishResponse: { publishId: any }) => {
        return publishResponse.publishId;
      })
      .catch((error: any) => {
        return;
      });
  } catch (error) {
    return;
  }
};
