import express from "express";
import { getBookings, setAvailability } from "../../controllers/appointment.controller";

const router = express.Router();

router.route("/:paraExpertId/set-availability").patch(setAvailability);
router.route("/:paraExpertId/get-bookings").get(getBookings)

export default router;

