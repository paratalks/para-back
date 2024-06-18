import { Request, Response } from "express";
import { asyncHandler } from "../util/asyncHandler";
import { listCategories } from "../util/home.util";
import { ApiResponse } from "../util/apiResponse";
import { ResponseStatusCode } from "../constants/constants";
import { ParaExpert } from "../models/paraExpert/paraExpert.model";
import { User } from "../models/user/user.model";
import { ObjectId } from "mongoose";
import { Review } from "../models/reviews/review.model";
import {banner} from "../constants/banner.json"

interface paraSearch {
  name:String;
  bio: String;
  basedOn: String;
  qualifications: [
    {
      title: String;
      certificateUrls: [String];
    }
  ];
  packages: {
    title: string;
    type: {
      type: String;
      enum: ["online", "offline"];
    };
    description: String;
    amount: Number;
  }[];
  reviews: any;
  image:string;
  experience: Number
}

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
      const { searchQuery } = req.params;

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
    const paraExperts: any[] = await ParaExpert.find().limit(10);

    const paraExpertUsers: { id:ObjectId, name:String, expertise:[String], image:string, ratings:Number }[] =
      await Promise.all(
        paraExperts.map(async (paraExpert) => {
          const user = await User.findById(paraExpert.userId);
          return { id:paraExpert._id, name:user.name, expertise:paraExpert.expertise, image:user.profilePicture, ratings:paraExpert.ratings, bio:paraExpert.bio, exp:paraExpert.experience };
        })
      );
    return res.json(
      new ApiResponse(ResponseStatusCode.SUCCESS, { categories, paraExperts:paraExpertUsers, banners:banner})
    );
  } catch (error) {
    return res.json(
      new ApiResponse(ResponseStatusCode.INTERNAL_SERVER_ERROR, error.message)
    );
  }
});

export const getParaExpertByID = asyncHandler(async(req: Request, res: Response)=>{
  try {
    const { id } = req.params;
    const paraExpert = await ParaExpert.findById(id);
    const user = await User.findById(paraExpert.userId);
    const reviews = await Review.find({paraExpertId:id})
    const result:paraSearch={name:user.name, bio:paraExpert.bio, basedOn:paraExpert.basedOn, qualifications:paraExpert.qualifications, packages:paraExpert.packages, reviews:reviews, image:user.profilePicture, experience:paraExpert.experience}
    return res.json(
      new ApiResponse(ResponseStatusCode.SUCCESS, result)
    );
  } catch (error) {
    return res.json(
      new ApiResponse(ResponseStatusCode.INTERNAL_SERVER_ERROR, error.message)
    );
  }
})

