import { Request, Response } from "express";
import { asyncHandler } from "../util/asyncHandler";
import { listCategories } from "../util/home.util";
import { ApiResponse } from "../util/apiResponse";
import { ResponseStatusCode } from "../constants/constants";
import { ParaExpert } from "../models/paraExpert/paraExpert.model";
import { User } from "../models/user/user.model";
import { paraExpertTypes } from "../models/paraExpert/paraExpert.types";

export const getCategories = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const categories = listCategories();
      return res.json(new ApiResponse(ResponseStatusCode.SUCCESS, categories));
    } catch (error) {
      return res.json(
        new ApiResponse(ResponseStatusCode.INTERNAL_SERVER_ERROR, error.message)
      );
    }
  }
);

export const getSearchResults = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { searchQuery } = req.body;

      let paraExperts: any = await ParaExpert.find({
        $or: [
          { name: { $regex: searchQuery, $options: "i" } },
          { expertise: { $in: searchQuery } },
          { expertise: { $elemMatch: { $in: [searchQuery] } } },
        ],
      });

      return res.json(new ApiResponse(ResponseStatusCode.SUCCESS, paraExperts));
    } catch (error) {
      return res.json(
        new ApiResponse(ResponseStatusCode.INTERNAL_SERVER_ERROR, error.message)
      );
    }
  }
);

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  try {
    const categories = listCategories();
    const paraExperts: paraExpertTypes[] = await ParaExpert.find().limit(10);

    const paraExpertUsers: { expertDetails: paraExpertTypes; userDetails: UserTypes }[] =
      await Promise.all(
        paraExperts.map(async (paraExpert) => {
          const user = await User.findById(paraExpert.userId);
          return { expertDetails:paraExpert, userDetails:user };
        })
      );
    return res.json(
      new ApiResponse(ResponseStatusCode.SUCCESS, { categories, paraExperts:paraExpertUsers })
    );
  } catch (error) {
    return res.json(
      new ApiResponse(ResponseStatusCode.INTERNAL_SERVER_ERROR, error.message)
    );
  }
});
