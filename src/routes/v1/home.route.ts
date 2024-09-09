import express from "express";
import {
  getCategories,
  getSearchResults,
  getAll,
  getParaExpertByID,
  getOnlineOfflinepackage,
  
} from "../../controllers/home.controller";
import { verifyJWT } from "../../middlewares/auth.middleware";

const router = express.Router();

router.route("/get-categories").get(verifyJWT,getCategories)
router.route("/search/:searchQuery").get(verifyJWT,getSearchResults)
router.route("/master").get(verifyJWT,getAll)
router.route("/paraexpert/:id").get(verifyJWT,getParaExpertByID)
router.route("/package-type/:id").get(verifyJWT,getOnlineOfflinepackage)

export default router;
