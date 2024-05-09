import { User } from "../models/user/user.model";
import { ParaExpert } from "../models/paraExpert/paraExpert.model";
import { Appointments } from "../models/appointments/appointments.model";
import { Notifications } from "../models/notification/notification.model";

export const notification = async(paraExpertId:string,appointmentId:string,image:string)=>{
    try{
        const paraExpert = await ParaExpert.findById(paraExpertId);
        const user = await User.findById(paraExpert.userId);
        const appointment = await Appointments.findById(appointmentId);
        const title = `Appointment successfully booked with ${user.name}`;
        const description = `Appointment booked on ${appointment.date} from ${appointment.startTime} to ${appointment.endTime}`;
        const referrer = "appointment";
        const referrerId=appointmentId;

        const createNotification=await Notifications.create({
            title,
            description,
            referrer,
            referrerId,
            image
        });

        return createNotification;
    }
    catch(error){
        return
    }
    
}