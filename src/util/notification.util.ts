import { User } from "../models/user/user.model";
import { ParaExpert } from "../models/paraExpert/paraExpert.model";
import { Appointments } from "../models/appointments/appointments.model";
import { Notifications } from "../models/notification/notification.model";
import { ObjectId } from "mongoose";
import { title } from "node:process";
const PushNotifications = require("@pusher/push-notifications-server");

export const notification = async (
  title:string,
  description:string,
  referrer: string,
  referrerId: any,
) => {
  try {

    const createNotification = await Notifications.create({
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
    .then((publishResponse: { publishId: any; }) => {
      return publishResponse.publishId;
    })
    .catch((error:any) => {
      return;
    });
}
