import experss from "express";
import { bookAppointment } from "../../controllers/appointment.controller";
import { getBookedAppointment } from "../../controllers/appointment.controller";
import { verifyJWT } from "../../middlewares/auth.middleware";

const router = experss.Router();

router.route("/:paraExpertId/book-appointment").post(bookAppointment);
router.route("/:userId/get-appointments").get(getBookedAppointment);

export default router;