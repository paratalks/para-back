import express from "express";
import { getCategories, getSearchResults } from "../../controllers/home.controller";

const router = express.Router();

router.route("/get-categories").get(getCategories)
router.route("/search").get(getSearchResults)

export default router;
