import express from 'express';
import { createBooking, getBookings,getbookingByPackageById, updateBookingStatus,getExpertsBookings,updatePackageBooking } from '../../controllers/packagesBooking.controller';
import { verifyJWT } from '../../middlewares/auth.middleware';
import { upload } from '../../util/s3Client.util';

const router = express.Router();


router.post('/booking', upload.single('prescriptionReport'),verifyJWT,createBooking);
router.route("/user/get-bookings").get(verifyJWT,getBookings);
router.route("/para/get-bookings").get(verifyJWT,getExpertsBookings);
router.route("/user/bookings/details").get(verifyJWT,getbookingByPackageById);
router.route("/user/update-booking/:bookingId").patch(verifyJWT,updatePackageBooking);
router.route('/updateBookingStatus/:bookingId').put(verifyJWT,updateBookingStatus);

export default router;
