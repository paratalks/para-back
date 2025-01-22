import express from "express";
import {getUploads} from '../../controllers/videoContent.controller'


const router = express.Router();

router.route("/").get(getUploads)


export default router;
