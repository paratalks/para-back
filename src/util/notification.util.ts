import { User } from "../models/user/user.model";
import { ParaExpert } from "../models/paraExpert/paraExpert.model";
import { Appointments } from "../models/appointments/appointments.model";
import { Notifications } from "../models/notification/notification.model";
import { ObjectId } from "mongoose";
import { title } from "node:process";
const PushNotifications = require("@pusher/push-notifications-server");
const admin = require("firebase-admin");
const serviceAccount = require("../../paratalks-admin.json");
import Queue from "bull";

export const notification = async (
  userId: ObjectId,
  title: string,
  description: string,
  referrer: string,
  referrerId: any,
  image?: String
) => {
  try {
    const createNotification = await Notifications.create({
      userId,
      title,
      description,
      referrer,
      referrerId,
      image,
    });
    return createNotification;
  } catch (error) {
    console.error("Failed to create notification:", error);
    return null;
  }
};


export const setFcm = async (userId: ObjectId, fcmToken: string) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { fcmToken },
      { new: true }
    );
    return updatedUser;
  } catch (error) {
    console.error("Failed to set FCM token:", error);
    return null;
  }
};


if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

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




export const sendNotif = async (token: String, title: string, body: string, bookingId:string) => {
  try {
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
          title: String(title),
          body: String(body),
          bookingId: String(bookingId)
        },
      },
      token: token,
    };
    
    const response = await admin.messaging().send(message);
    return response;
  } catch (error) {
    return null;
  }
};



// Initialize a Bull queue
export const notificationQueue = new Queue("notifications", {
  redis: {
    host: "127.0.0.1",
    port: 6379,
  },
});

// Process notifications asynchronously
notificationQueue.process(async (job, done) => {
  const { fcmToken, title, message, userId, appointmentId, type, profilePicture } = job.data;
  
  try {
    // Log that the job has started processing
    console.log(`Processing notification for user ${userId} and appointment ${appointmentId}...`);

    // Send notification to user/paraExpert
    await sendNotif(fcmToken, title, message, appointmentId);

    // Create notification in DB
    await notification(userId, title, message, type, appointmentId, profilePicture);

    // Log success after notification has been sent
    console.log(`Notification successfully sent to user ${userId} for appointment ${appointmentId}`);

    done(); // Mark job as done
  } catch (error) {
    // Log failure if notification fails
    console.error(`Failed to send notification to user ${userId} for appointment ${appointmentId}: `, error);
    done(new Error(`Failed to send notification: ${error.message}`)); // Mark job as failed
  }
});



