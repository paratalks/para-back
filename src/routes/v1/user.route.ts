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
import multer from 'multer';
// /**
//  * Endpoint: /api/v1/user
//  */

const router = express.Router();

// // const RESTICT_TO = "admin";

// router
//     .route("/") //
//     .get(authorization, getAllUsers);

const upload = multer({ storage: multer.memoryStorage() });
const uploadFile = (fieldName: string) => upload.single(fieldName);

router.patch('/uploadProfile/:userId', uploadFile('profilePicture'), uploadProfile);
router.route("/set-availability/:paraExpId").patch(setAvailability);
router.route("/update-user/:userId").patch(updateUserDetails);
router.route("/update-para").patch(verifyJWT,updateParaExpertDetails);
router.route("/me/:userId").get(getUserById);
router.route("/get-notifications").get(verifyJWT, getNotifications)
router.route("/dev").patch(dev)

export default router;