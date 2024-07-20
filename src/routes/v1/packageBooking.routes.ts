import express from 'express';
import { createBooking, getBookings,getbookingByPackageById, updateBookingStatus,getExpertsBookings } from '../../controllers/packagesBooking.controller';
import { verifyJWT } from '../../middlewares/auth.middleware';
import multer from 'multer';

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });
const uploadFile = (fieldName: string) => upload.single(fieldName);

router.post('/booking', uploadFile('prescriptionReport'),createBooking);
router.route("/user/get-bookings").get(verifyJWT,getBookings);
router.route("/para/get-bookings").get(verifyJWT,getExpertsBookings);
router.route("/user/bookings/details").get(verifyJWT,getbookingByPackageById);
router.route('/updateBookingStatus/:bookingId').put(updateBookingStatus);

export default router;
