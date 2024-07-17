import express from "express";
import { getUsers,getParaExpert,getParaExpertByID,paraExpertSignup,getAppointments} from "../../controllers/admin.controller"
import { hasAdminAccess } from "../../middlewares/auth.middleware";

const router = express.Router();


router.route("/get-all/users").get(hasAdminAccess,getUsers);
router.route("/get-all/paraExpert").get(hasAdminAccess,getParaExpert);
router.route("/get-paraExpert/:paraExpertID").get(hasAdminAccess,getParaExpertByID);
router.route("/paraExpert/signup").post(hasAdminAccess,paraExpertSignup);
router.route("/get-all/appointments").get(hasAdminAccess,getAppointments);


export default router;