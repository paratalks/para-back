import express from "express";
import { getUsers, getParaExpert, getParaExpertByID, paraExpertSignup, getAppointments, getDashboardData, getAppointmentById, getUserById, updateUserById, updateParaExpertById } from "../../controllers/admin.controller"
import { hasAdminAccess } from "../../middlewares/auth.middleware";

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

export default router;
