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

const router = express.Router();


router.post('/uploadProfile/:userId', uploadFile.single('profilePicture'), uploadProfile);
router.route("/update-user/:userId").patch(updateUserDetails);
router.route("/update-para").patch(verifyJWT,updateParaExpertDetails);
router.route("/me/:userId").get(getUserById);
router.route("/get-notifications").get(verifyJWT, getNotifications)
router.route("/dev").patch(dev)

export default router;