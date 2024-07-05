import express from "express";
import { verifyJWT } from "../../middlewares/auth.middleware";
import {
  setAvailability,
  updateUserDetails,
  updateParaExpertDetails,
  getUserById,
  getNotifications,
  uploadProfile,
  dev,
} from "../../controllers/userUpdate.controller";


import { upload } from '../../middlewares/upload';

// /**
//  * Endpoint: /api/v1/user
//  */

const router = express.Router();

// // const RESTICT_TO = "admin";

// router
//     .route("/") //
//     .get(authorization, getAllUsers);





router.route("/set-availability/:paraExpId").patch(setAvailability);
router.route("/update-user").patch(verifyJWT,updateUserDetails);
router.route("/update-para").patch(verifyJWT,updateParaExpertDetails);
router.route("/me/:userId").get(getUserById);
router.patch('/upload/:userId', upload.single('file'), uploadProfile);
router.route("/get-notifications").get(verifyJWT, getNotifications)
router.route("/dev").patch(dev)

export default router;
