import express from "express";
import multer from "multer";
import { getImage, postImage } from "../../controllers/fileUpload.controller";
import { verifyJWT } from "../../middlewares/auth.middleware";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.route("/post").post(upload.single('image'),postImage)
router.route("/get/:imageName").post(getImage)
router.route("/delete/:imageName").post(verifyJWT, getImage);