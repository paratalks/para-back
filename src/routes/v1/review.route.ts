import express from "express";
import { addReview, getParaReviews } from "../../controllers/review.controller";
import { verifyJWT } from "../../middlewares/auth.middleware";

const router = express.Router()

router.route("/add-review/:paraExpertId").post(verifyJWT, addReview);
router.route("/get-para-review/:paraExpertId").get(getParaReviews);

export default router;
