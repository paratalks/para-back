import express from "express";
import { getBookings, getParaExpertAvailability } from "../../controllers/appointment.controller";
import { verifyJWT } from "../../middlewares/auth.middleware";
import { setAvailability } from "../../controllers/userUpdate.controller";
const router = express.Router();

router.route("/get-bookings").get(verifyJWT,getBookings);
router.route("/get-available-slots").get(getParaExpertAvailability);
router.route("/set-availability/:paraExpId").patch(setAvailability);



export default router;

