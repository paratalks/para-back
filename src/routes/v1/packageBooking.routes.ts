import express from 'express';
import { createBooking, getBookings,getbookingByPackageById, updateBookingStatus,getExpertsBookings,updatePackageBooking } from '../../controllers/packagesBooking.controller';
import { verifyJWT } from '../../middlewares/auth.middleware';
import { uploadFile } from '../../util/s3Client.util';

const router = express.Router();


router.post('/booking', uploadFile.single('prescriptionReport'),createBooking);
router.route("/user/get-bookings").get(verifyJWT,getBookings);
router.route("/para/get-bookings").get(verifyJWT,getExpertsBookings);
router.route("/user/bookings/details").get(verifyJWT,getbookingByPackageById);
router.route("/user/update-booking/:bookingId").patch(updatePackageBooking);
router.route('/updateBookingStatus/:bookingId').put(updateBookingStatus);

export default router;
