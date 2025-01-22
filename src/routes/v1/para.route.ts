import express from "express";
import { getParaExpertsBookings,getBookingById, getParaExpertAvailability } from "../../controllers/appointment.controller";
import { verifyJWT } from "../../middlewares/auth.middleware";
import { setAvailability, getAvailability, updateParaExpertDetails, getParaExpertDetails, uploadQualificationDetails } from "../../controllers/userUpdate.controller";
import { uploadFile } from "../../util/s3Client.util";
const router = express.Router();

router.route("/get-bookings").get(verifyJWT, getParaExpertsBookings);
router.route("/get-booking/:bookingId").get(verifyJWT, getBookingById);

router.route("/get-available-slots").get( getParaExpertAvailability);
router.route("/set-availability").patch(verifyJWT, setAvailability);
router.route("/get-availability").get(verifyJWT, getAvailability);

router.route("/update").patch(verifyJWT, updateParaExpertDetails);
router.route("/me").get(verifyJWT, getParaExpertDetails);
router.post('/uploadCertificate', uploadFile.single('uploadCertificate'), uploadQualificationDetails);


export default router;

