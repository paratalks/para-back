import express from "express";
import { getPackageById, createExpertPackages,getExpertPackages,deletePackageById,updatePackageById } from '../../controllers/packages.controller';
import { verifyJWT } from '../../middlewares/auth.middleware';

const router = express.Router();

router.route("/create").post(verifyJWT,createExpertPackages);
router.route("/:packageId").get(verifyJWT, getPackageById);
router.route("/:packageId").patch(verifyJWT, updatePackageById);
router.route("/delete/:packageId").delete(verifyJWT,deletePackageById);
router.route("/").get(verifyJWT,getExpertPackages);

export default router;
