import nodemailer from "nodemailer";

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  secure: true,
  port: 465,
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

export const sendMail = async (options: MailOptions): Promise<void> => {
  const mailOptions = {
    from:{
        name: process.env.EMAIL_NAME,
        address: process.env.EMAIL_USER,
    },
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};


export const userBookingConfirmationTemplate = (
    date: string,
    startTime: string,
    endTime: string,
    appointmentMethod: string,
  ): string => {
    return `
    <div style="font-family: Arial, sans-serif; color: #333;">
    <h3 style="color: #4CAF50;">Appointment Confirmation</h3>
    <p>Dear [User's Name],</p>

    <p>We're excited to inform you that your appointment has been confirmed by the para-expert!</p>

    <p><strong>Appointment Details:</strong></p>
    <ul style="list-style-type: none; padding: 0;">
        <li><strong>Date:</strong> ${date}</li>
        <li><strong>Time:</strong> ${startTime} - ${endTime}</li>
        <li><strong>Appointment Type:</strong> ${appointmentMethod}</li>
    </ul>

    <p>
        <span style="color: red; font-weight: bold;">IMPORTANT:</span>
        When your scheduled time slot arrives, our expert will contact you through our app. You will receive a notification in the app. Simply open the app, go to the notifications section, select the call notification, and you'll see a button to join the call.
    </p>
    
    <p>For video calls, please ensure you have a stable internet connection and a quiet environment to make the most of your session.</p>
    <p>If you need to reschedule your appointment, simply visit our app or reach out to us directly.</p>

    <br>
    <p>Thank you for choosing Paratalks. We look forward to providing you with an excellent experience.</p>

</div>
    `;
  };
  
  // export const paraExpertBookingNotificationTemplate = (
  //   date: string,
  //   startTime: string,
  //   endTime: string
  // ): string => {
  //   return `
  //     <div style="font-family: Arial, sans-serif; color: #333;">
  //       <h3 style="color: #4CAF50;">New Appointment Request</h3>
  //       <p>You have a new confirmed appointment!</p>
  //       <p>The appointment is scheduled for <strong>${date}</strong> from <strong>${startTime}</strong> to <strong>${endTime}</strong>.</p>
  //       <p>Please prepare for the session.</p>
  //       <br>
  //       <br>
  //       <p>Warm Regards,</p>
  //       <p>Paratalks</p>
  //     </div>
  //   `;
  // };

  export const paraExpertBookingNotificationTemplate = (
    date: string,
    startTime: string,
    endTime: string,
    appointmentMethod: string,
  ): string => {
    return `<div style="font-family: Arial, sans-serif; color: #333;">
    <h3 style="color: #4CAF50;">New Appointment Request</h3>
    <p>Dear [Para Expert's Name],</p>

    <p>We are pleased to inform you that a new appointment has been booked for your services:</p>

    <p><strong>Appointment Details:</strong></p>
    <ul style="list-style-type: none; padding: 0;">
        <li><strong>Date:</strong> ${date}</li>
        <li><strong>Time:</strong> ${startTime} - ${endTime}</li>
        <li><strong>Appointment-Type:</strong> ${appointmentMethod}</li>
    </ul>

    <p>Please log in to the Paratalks app to confirm or cancel this appointment. If you are unable to accept this booking, we recommend updating your availability at the earliest to avoid inconvenience for the client.</p>
    
    <p>Your prompt action in confirming or managing this appointment is greatly appreciated. If confirmed, kindly ensure you are prepared for the session.</p>

    <br>
    <p>Thank you for choosing Paratalks. We look forward to providing you with an excellent experience.</p>

</div>`;
};

export const userBookingCanceledTemplate = (
  date: string,
  startTime: string,
  endTime: string,
  appointmentMethod: string,
): string => {
  return `
<div style="font-family: Arial, sans-serif; color: #333;">
    <h3 style="color: #e74c3c;">Appointment Cancellation Notice</h3>
    <p>Dear [User's Name],</p>

    <p>We regret to inform you that your recent appointment has been canceled by the Para-expert.</p>

    <p><strong>Appointment Details:</strong></p>
    <ul style="list-style-type: none; padding: 0;">
        <li><strong>Date:</strong> ${date}</li>
        <li><strong>Time:</strong> ${startTime} - ${endTime}</li>
        <li><strong>Appointment-Type:</strong> ${appointmentMethod}</li>
    </ul>

    <p>A refund for the full amount paid will be processed to your original payment method. Please allow 5-7 business days for the refund to reflect in your account.</p>

    <p>We apologize for any inconvenience caused. If you would like to reschedule or need assistance, please feel free to contact our support team.</p>

    <br>
    <p>Thank you for choosing Paratalks. We look forward to providing you with an excellent experience.</p>
</div> `
};
