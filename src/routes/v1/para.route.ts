import express from "express";
import { getBookings, getParaExpertAvailability } from "../../controllers/appointment.controller";
import { verifyJWT } from "../../middlewares/auth.middleware";
import { setAvailability ,createAndUpdateExpertPackages} from "../../controllers/userUpdate.controller";
const router = express.Router();

router.route("/get-bookings").get(verifyJWT,getBookings);
router.route("/get-available-slots").get(verifyJWT,getParaExpertAvailability);
router.route("/set-availability").patch(verifyJWT,setAvailability);
router.route("/create-and-update-packages").patch(verifyJWT,createAndUpdateExpertPackages);


export default router;

