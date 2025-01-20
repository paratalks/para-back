import express from "express";
import { getUsers, getParaExpert, getParaExpertByID, paraExpertSignup, getAppointments, getDashboardData, getAppointmentById, getUserById, updateUserById, updateParaExpertById, getPackageBookings, getUploads } from "../../controllers/admin.controller"
import { hasAdminAccess } from "../../middlewares/auth.middleware";
import { createAccount } from "../../controllers/account.controller";
import { getUploadsAdmin,getDeleteVideo,getUpdateVideo } from "../../controllers/videoContent.controller";

const router = express.Router();


router.route("/paraExpert/signup").post(hasAdminAccess, paraExpertSignup);
router.route("/get-paraExpert/:paraExpertID").get(hasAdminAccess, getParaExpertByID);
router.route("/update-paraExpert/:paraExpertID").patch(hasAdminAccess, updateParaExpertById);
router.route("/get-all/paraExpert").get(hasAdminAccess, getParaExpert);
router.route("/get-all/users").get(hasAdminAccess, getUsers);
router.route("/get-user/:userId").get(hasAdminAccess, getUserById);
router.route("/update-user/:userId").patch(hasAdminAccess, updateUserById);
router.route("/get-all/appointments").get(hasAdminAccess, getAppointments);
router.route("/get-appointment/:appointmentId").get(hasAdminAccess, getAppointmentById);
router.route("/dashboard-data").get(hasAdminAccess, getDashboardData);
router.route("/package/get-all/bookings").get(hasAdminAccess, getPackageBookings);
router.route('/uploads').post(hasAdminAccess,getUploadsAdmin)
router.route('/uploadsDelete/:id').get(hasAdminAccess,getDeleteVideo)
router.route('/uploadsUpdate').get(hasAdminAccess,getUpdateVideo)

router.route("/create-account/:expertId").post(hasAdminAccess,createAccount);

export default router;
