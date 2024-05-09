import express from "express";
import { verifyJWT } from "../../middlewares/auth.middleware";
import { setAvailability, updateUserDetails, updateParaExpertDetails } from "../../controllers/userUpdate.controller";


// /**
//  * Endpoint: /api/v1/user
//  */

const router = express.Router();

// // const RESTICT_TO = "admin";

// router
//     .route("/") //
//     .get(authorization, getAllUsers);

router.route("/:paraExpertId/set-availability").patch(verifyJWT,setAvailability);
router.route("/:userId/update-user").patch(verifyJWT,updateUserDetails);
router.route("/:paraExpertId/update-para").patch(verifyJWT,updateParaExpertDetails);


export default router;
