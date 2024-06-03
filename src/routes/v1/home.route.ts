import express from "express";
import { getCategories, getSearchResults, getAll } from "../../controllers/home.controller";

const router = express.Router();

router.route("/get-categories").get(getCategories)
router.route("/search").get(getSearchResults)
router.route("/master").get(getAll)

export default router;
