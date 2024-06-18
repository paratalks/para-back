import express from "express";
import {
  getCategories,
  getSearchResults,
  getAll,
  getParaExpertByID,
  webHome,
} from "../../controllers/home.controller";

const router = express.Router();

router.route("/get-categories").get(getCategories)
router.route("/search/:searchQuery").get(getSearchResults)
router.route("/master").get(getAll)
router.route("/paraexpert/:id").get(getParaExpertByID)
router.route("/web-master").get(webHome)

export default router;
