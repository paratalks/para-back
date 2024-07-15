import { User } from "../models/user/user.model";
import { ParaExpert } from "../models/paraExpert/paraExpert.model";
import { Appointments } from "../models/appointments/appointments.model";
import { Notifications } from "../models/notification/notification.model";
import { ObjectId } from "mongoose";
import { title } from "node:process";
const PushNotifications = require("@pusher/push-notifications-server");
const admin = require("firebase-admin");
admin.initializeApp()

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
      instanceId: "process.env.PUSHER_INSTANCE_ID",
      secretKey: "process.env.PUSHER_SECRET_KEY",
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


export const sendNotif = async (token:String, title:String, body:String) => {
  try {
    const serviceAccount = require("../../paratalks-admin.json");
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    },
    "parauser"
  );
    if (!token || typeof token !== "string") {
      throw new Error("Invalid FCM token provided");
    }
    const message = {
      notification: {
        title: title,
        body: body,
      },
      android: {
        notification: {
          sound: "default",
        },
        data: {
          title: title,
          body: body,
        },
      },
      token: token,
    };
    const response = await admin.messaging().send(message);
    console.log("Successfully sent message:", response);
  } catch (error) {
    console.error("Error sending message:", error.message);
    throw error;
  }
};


export const sendParaNotif = async (token: String, title: String, body: String) => {
  try {

    const serviceAccount2 = require("../../paraexperts-app-admin.json");
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount2),
    },
    "paraexpert"
  );

    if (!token || typeof token !== "string") {
      throw new Error("Invalid FCM token provided");
    }
    const message = {
      notification: {
        title: title,
        body: body,
      },
      android: {
        notification: {
          sound: "default",
        },
        data: {
          title: title,
          body: body,
        },
      },
      token: token,
    };
    const response = await admin.messaging().send(message);
    console.log("Successfully sent message:", response);
  } catch (error) {
    console.error("Error sending message:", error.message);
    throw error;
  }
};