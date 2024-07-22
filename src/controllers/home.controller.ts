import { Request, Response } from "express";
import { asyncHandler } from "../util/asyncHandler";
import { listCategories } from "../util/home.util";
import { ApiResponse } from "../util/apiResponse";
import { ResponseStatusCode } from "../constants/constants";
import { ParaExpert } from "../models/paraExpert/paraExpert.model";
import { User } from "../models/user/user.model";
import { ObjectId } from "mongoose";
import { banner } from "../constants/banner.json";
import { getReviews } from "../util/paraexpert.util";

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
      })
        .select("ratings expertise _id userId profilePicture")
        .limit(10)
        .populate({
          path: "userId",
          model: "User",
          select: "name",
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
    const { limit }: any = req.query;
    const limitNumber = +limit;
    const categories = listCategories();
    const paraExperts: any[] = await ParaExpert.find().limit(limitNumber)
    .select("expertise ratings ")
        .populate({
          path: "userId",
          model: "User",
          select:
            "name profilePicture ",
        });

    return res.json(
      new ApiResponse(ResponseStatusCode.SUCCESS, {
        categories,
        paraExperts,
        banners: banner,
      })
    );
  } catch (error) {
    return res.json(
      new ApiResponse(ResponseStatusCode.INTERNAL_SERVER_ERROR, error.message)
    );
  }
});

export const getParaExpertByID = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const paraExpert = await ParaExpert.findById(id)
        .select("-createdAt -updatedAt -__v -availability")
        .populate({
          path: "userId",
          model: "User",
          select:
            "name gender profilePicture ",
        });

      if (!paraExpert) {
        return res.json(
          new ApiResponse(
            ResponseStatusCode.NOT_FOUND,
            {},
            "ParaExpert not found"
          )
        );
      }
      const user = await User.findById(paraExpert.userId);
      const reviews = await getReviews(paraExpert._id);

      return res.json(
        new ApiResponse(
          ResponseStatusCode.SUCCESS,
          { paraExpert, reviews },
          "para expert fetched successfully"
        )
      );
    } catch (error) {
      return res.json(
        new ApiResponse(ResponseStatusCode.INTERNAL_SERVER_ERROR, error.message)
      );
    }
  }
);

export const getOnlineOfflinepackage = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { type } = req.query;
      const packageType: String = String(type);
      const paraExpert = await ParaExpert.findById(id);

      if (!paraExpert) {
        return res.json(
          new ApiResponse(
            ResponseStatusCode.NOT_FOUND,
            {},
            "ParaExpert not found"
          )
        );
      }

      const packages = paraExpert.packages.filter(
        (pack) => pack.type === packageType
      );

      return res.json(
        new ApiResponse(
          ResponseStatusCode.SUCCESS,
          packages,
          "Packages fetched successfully"
        )
      );
    } catch (error) {
      return res.json(
        new ApiResponse(ResponseStatusCode.INTERNAL_SERVER_ERROR, error.message)
      );
    }
  }
);

// export const webHome = asyncHandler(async (req: Request, res: Response) => {
//   try {
//     const { limit }: any = req.query;
//     const limitNumber = +limit;
//     const paraExperts = await ParaExpert.find().limit(limitNumber);
//     const result: {
//       id: ObjectId;
//       name: String;
//       expertise: [String];
//       image: string;
//       qualifications: [{ title: String; certificateUrls: [String] }];
//       socials: {
//         instagram: String;
//         twitter: String;
//         linkenIn: String;
//       };
//     }[] = await Promise.all(
//       paraExperts.map(async (para) => {
//         const user = await User.findById(para.userId);
//         return {
//           id: para._id,
//           name: user.name,
//           expertise: para.expertise,
//           image: user.profilePicture,
//           qualifications: para.qualifications,
//           socials: para.socials,
//         };
//       })
//     );
//     return res.json(
//       new ApiResponse(
//         ResponseStatusCode.SUCCESS,
//         result,
//         "paraExperts fetched successfully"
//       )
//     );
//   } catch (error) {
//     return res.json(
//       new ApiResponse(ResponseStatusCode.INTERNAL_SERVER_ERROR, error.message)
//     );
//   }
// });
