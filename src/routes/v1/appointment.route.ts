import experss from "express";
import { bookAppointment, getAppointmentById, updateAppointment,updateAppointmentStatus,  } from "../../controllers/appointment.controller";
import { getBookedAppointment,getBookingStatsByMonth } from "../../controllers/appointment.controller";
import { verifyJWT } from "../../middlewares/auth.middleware";

const router = experss.Router();

router
  .route("/book-appointment/:paraExpertId")
  .post(verifyJWT,bookAppointment);
router.route("/get-appointments").get(verifyJWT, getBookedAppointment);
router.route("/update-appointment/:bookingId").patch(verifyJWT,updateAppointment);
router.route("/appointment/:bookingId").get(verifyJWT,getAppointmentById);
router.route('/updateAppointmentStatus/:bookingId').put(verifyJWT,updateAppointmentStatus);
router.route('/appointment-data').get(verifyJWT,getBookingStatsByMonth);


export default router;