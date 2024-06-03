import experss from "express";
import { bookAppointment } from "../../controllers/appointment.controller";
import { getBookedAppointment } from "../../controllers/appointment.controller";
import { verifyJWT } from "../../middlewares/auth.middleware";

const router = experss.Router();

router
  .route("/book-appointment/:paraExpertId")
  .post(verifyJWT, bookAppointment);
router.route("/get-appointments").get(getBookedAppointment);

export default router;