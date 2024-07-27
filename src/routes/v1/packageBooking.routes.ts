import express from 'express';
import { createBooking, getBookings,getbookingByPackageById, updateBookingStatus,getExpertsBookings } from '../../controllers/packagesBooking.controller';
import { verifyJWT } from '../../middlewares/auth.middleware';
import { uploadFile } from '../../util/s3Client.util';

const router = express.Router();


router.post('/booking', uploadFile('prescriptionReport'),createBooking);
router.route("/user/get-bookings").get(verifyJWT,getBookings);
router.route("/para/get-bookings").get(verifyJWT,getExpertsBookings);
router.route("/user/bookings/details").get(verifyJWT,getbookingByPackageById);
router.route('/updateBookingStatus/:bookingId').put(verifyJWT,updateBookingStatus);

export default router;
