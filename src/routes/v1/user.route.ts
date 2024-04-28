import express from "express";
import { verifyJWT } from "../../middlewares/auth.middleware";
import { updateUserDetails } from "../../controllers/user.controller";
import { updateParaExpertDetails } from "../../controllers/user.controller";
import { getParaExpertAvailability } from "../../controllers/appointment.controller";


// /**
//  * Endpoint: /api/v1/user
//  */

const router = express.Router();

// // const RESTICT_TO = "admin";

// router
//     .route("/") //
//     .get(authorization, getAllUsers);

router.route("/:userId/update-user").patch(verifyJWT,updateUserDetails);
router.route("/:paraExpertId/update-para").patch(verifyJWT,updateParaExpertDetails);
router.route("/get-available-slots").get(getParaExpertAvailability)


export default router;
