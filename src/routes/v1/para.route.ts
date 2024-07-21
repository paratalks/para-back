import express from "express";
import { getBookings, getParaExpertAvailability } from "../../controllers/appointment.controller";
import { verifyJWT } from "../../middlewares/auth.middleware";
import { setAvailability, getAvailability, updateParaExpertDetails, getParaExpertDetails, uploadQualificationDetails } from "../../controllers/userUpdate.controller";
import { uploadFile } from "../../util/s3Client.util";
const router = express.Router();

router.route("/get-bookings").get(verifyJWT, getBookings);
router.route("/get-available-slots").get(verifyJWT, getParaExpertAvailability);
router.route("/set-availability").patch(verifyJWT, setAvailability);
router.route("/get-availability").get(verifyJWT, getAvailability);
router.route("/update").patch(verifyJWT, updateParaExpertDetails);
router.route("/me").get(verifyJWT, getParaExpertDetails);
router.post('/uploadCertificate', uploadFile('uploadCertificate'), uploadQualificationDetails);


export default router;

