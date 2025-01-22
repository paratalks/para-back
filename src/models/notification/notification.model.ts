import {model} from "mongoose"
import type { notificationDocument } from "./notification.types"
import notificationSchema from "./notification.schema"

export const Notifications = model<notificationDocument>(
    "notifications",
    notificationSchema
)   