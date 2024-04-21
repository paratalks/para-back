import experss from "express";
import { bookAppointment } from "../../controllers/appointment.controller";


const router = experss.Router();

router.route("/book-appointment").post(bookAppointment);
router.route