import experss from "express";
import { bookAppointment } from "../../controllers/appointment.controller";
import { getBookedAppointment } from "../../controllers/appointment.controller";

const router = experss.Router();

router.route("/:userId/book-appointment").post(bookAppointment);
router.route("/:userId/getAppointments").get(getBookedAppointment);

