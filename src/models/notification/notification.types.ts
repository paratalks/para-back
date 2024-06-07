import type { Document,Model,ObjectId } from "mongoose";

export interface notifocationTypes {
    title: string,
    description:string,
    referrer: string,
    referrerId: ObjectId,
}

export interface notificationDocument extends notifocationTypes, Document {}

export interface notificationModel extends Model<notificationDocument> {} 