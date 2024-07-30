import type { Document,Model,ObjectId } from "mongoose";

export interface notifocationTypes {
    userId:ObjectId,
    title: string,
    description:string,
    referrer: string,
    referrerId: ObjectId,
    image?: string,
}

export interface notificationDocument extends notifocationTypes, Document {}

export interface notificationModel extends Model<notificationDocument> {} 