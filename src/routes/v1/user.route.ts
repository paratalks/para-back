import express from "express";
import { verifyJWT } from "../../middlewares/auth.middleware";
import { updateUserDetails } from "../../controllers/user.controller";
import { updateParaExpertDetails } from "../../controllers/user.controller";


// /**
//  * Endpoint: /api/v1/user
//  */

const router = express.Router();

// // const RESTICT_TO = "admin";

// router
//     .route("/") //
//     .get(authorization, getAllUsers);

router.route("/update-user").patch(verifyJWT, updateUserDetails);
router.route("/update-paraExpert").patch(verifyJWT, updateParaExpertDetails);


export default router;
