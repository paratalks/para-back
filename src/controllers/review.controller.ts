import { Request, Response } from "express";
import { asyncHandler } from "../util/asyncHandler";
import { ApiResponse } from "../util/apiResponse";
import { ResponseStatusCode } from "../constants/constants";
import { Review } from "../models/reviews/review.model";
import { ParaExpert } from "../models/paraExpert/paraExpert.model";
import { User } from "../models/user/user.model";
import mongoose, { ObjectId } from "mongoose";

export const addReview = asyncHandler(async (req: Request, res: Response) => {
  const { paraExpertId } = req.params
  const { review, rating } = req.body
  const user = req.user
  const userId = user._id
  try {
    if (!review || !rating) {
      return res.json(new ApiResponse(ResponseStatusCode.BAD_REQUEST, "All fields are required"))
    }

    const reviews = await Review.create({
      paraExpertId,
      userId,
      review,
      rating
    })
    if (!reviews) {
      return res.json(
        new ApiResponse(
          ResponseStatusCode.BAD_REQUEST,
          "Failed to submit review"
        )
      );
    }

    const averageRating = await Review.aggregate([
      {
        $match: { paraExpertId: new mongoose.Types.ObjectId(paraExpertId) },
      },
      {
        $group: {
          _id: { paraExpertId: "$paraExpertId" },
          averageRating: { $avg: "$rating" },
        },
      },
    ]);

    const para = await ParaExpert.findByIdAndUpdate(paraExpertId,
      {
        $set: {
          ratings: averageRating[0].averageRating
        }
      },
      { new: true }
    )

    return res.json(
      new ApiResponse(
        ResponseStatusCode.SUCCESS,
        { reviews },
        "Review submitted successfully"
      )
    );

  } catch (error) {
    return res.json(
      new ApiResponse(ResponseStatusCode.INTERNAL_SERVER_ERROR, error.message)
    );
  }
})

export const getParaReviews = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { paraExpertId } = req.params
    const reviews = await Review.find({ paraExpertId })
    const result: { id: ObjectId, name: String, rating: Number, review: String }[] =
      await Promise.all(
        reviews.map(async (review) => {
          const user = await User.findById(review.userId)
          return { id: review._id, name: user.name, rating: review.rating, review: review.review }
        }))
    if (!reviews) {
      return res.json(new ApiResponse(ResponseStatusCode.NOT_FOUND, "No reviews found"))
    }
    return res.json(new ApiResponse(ResponseStatusCode.SUCCESS, result))
  } catch (error) {
    return res.json(
      new ApiResponse(ResponseStatusCode.INTERNAL_SERVER_ERROR, error.message)
    );
  }
})