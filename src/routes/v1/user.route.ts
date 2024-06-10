import express from "express";
import { verifyJWT } from "../../middlewares/auth.middleware";
import {
  setAvailability,
  updateUserDetails,
  updateParaExpertDetails,
  getUserById,
  getNotifications,
} from "../../controllers/userUpdate.controller";


// /**
//  * Endpoint: /api/v1/user
//  */

const router = express.Router();

// // const RESTICT_TO = "admin";

// router
//     .route("/") //
//     .get(authorization, getAllUsers);

router.route("/set-availability").patch(verifyJWT,setAvailability);
router.route("/update-user").patch(verifyJWT,updateUserDetails);
router.route("/update-para").patch(verifyJWT,updateParaExpertDetails);
router.route("/:userId").get(getUserById);
router.route("/get-notifications").get(verifyJWT, getNotifications)


export default router;
