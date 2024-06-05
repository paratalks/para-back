import express from "express";
import {
  getCategories,
  getSearchResults,
  getAll,
  getParaExpertByID,
} from "../../controllers/home.controller";

const router = express.Router();

router.route("/get-categories").get(getCategories)
router.route("/search").get(getSearchResults)
router.route("/master").get(getAll)
router.route("/paraexpert/:id").get(getParaExpertByID)

export default router;
