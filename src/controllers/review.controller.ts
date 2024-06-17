import { Request, Response } from "express";
import { asyncHandler } from "../util/asyncHandler";
import { ApiResponse } from "../util/apiResponse";
import { ResponseStatusCode } from "../constants/constants";
import { Review } from "../models/reviews/review.model";

export const addReview = asyncHandler(async (req: Request, res: Response)=>{
    const {paraExpertId} = req.params
    const {review, rating} = req.body
    const user = req.user
    const userId = user._id
    try {
        if(!review || !rating){
            return res.json(new ApiResponse(ResponseStatusCode.BAD_REQUEST, "All fields are required"))
        }
        const reviews = await Review.create({
            paraExpertId,
            userId,
            review,
            rating
        })
        if(!reviews){
            return res.json(new ApiResponse(ResponseStatusCode.BAD_REQUEST, "Failed to submit review"))
        }

        return res.json(
          new ApiResponse(
            ResponseStatusCode.SUCCESS,
            reviews,
            "Review submitted successfully"
          )
        );

    } catch (error) {
      return res.json(
        new ApiResponse(ResponseStatusCode.INTERNAL_SERVER_ERROR, error.message)
      );
    }
})

export const getParaReviews = asyncHandler(async (req: Request, res: Response)=>{
    try {
        const {paraExpertId} = req.params
        const reviews = await Review.find({paraExpertId})
        if(!reviews){
            return res.json(new ApiResponse(ResponseStatusCode.NOT_FOUND, "No reviews found"))
        }
        return res.json(new ApiResponse(ResponseStatusCode.SUCCESS, reviews))
    } catch (error) {
      return res.json(
        new ApiResponse(ResponseStatusCode.INTERNAL_SERVER_ERROR, error.message)
      );
    }
})