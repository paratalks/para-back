import express from 'express';
import { createBooking, getBookings, updateBookingStatus,getExpertsBookings } from '../../controllers/packagesBooking.controller';
import { verifyJWT } from '../../middlewares/auth.middleware';
import multer from 'multer';

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });
const uploadFile = (fieldName: string) => upload.single(fieldName);

router.post('/createBooking', uploadFile('prescriptionReport'),createBooking);
router.route("/user/get-bookings").get(verifyJWT,getBookings);
router.route("/para/get-bookings").get(verifyJWT,getExpertsBookings);
router.route('/updateBookingStatus/:bookingId').put(updateBookingStatus);

export default router;
