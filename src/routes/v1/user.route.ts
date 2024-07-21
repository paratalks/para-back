import express from "express";
import { verifyJWT } from "../../middlewares/auth.middleware";
import {
  updateUserDetails,
  updateParaExpertDetails,
  getUserById,
  getNotifications,
  uploadProfile,
  dev,
} from "../../controllers/userUpdate.controller";
import { uploadFile } from "../../util/s3Client.util";
// /**
//  * Endpoint: /api/v1/user
//  */

const router = express.Router();

// // const RESTICT_TO = "admin";

// router
//     .route("/") //
//     .get(authorization, getAllUsers);


router.patch('/uploadProfile/:userId', uploadFile('profilePicture'), uploadProfile);
router.route("/update-user/:userId").patch(updateUserDetails);
router.route("/update-para").patch(verifyJWT,updateParaExpertDetails);
router.route("/me/:userId").get(getUserById);
router.route("/get-notifications").get(verifyJWT, getNotifications)
router.route("/dev").patch(dev)

export default router;