import experss from "express";
import { bookAppointment, getAppointmentById, updateAppointment } from "../../controllers/appointment.controller";
import { getBookedAppointment } from "../../controllers/appointment.controller";
import { verifyJWT } from "../../middlewares/auth.middleware";

const router = experss.Router();

router
  .route("/book-appointment/:paraExpertId/:userId")
  .post(verifyJWT,bookAppointment);
router.route("/get-appointments").get(verifyJWT,getBookedAppointment);
router.route("/update-appointments").patch(updateAppointment);
router.route("/appointment/:id").get(getAppointmentById);

export default router;