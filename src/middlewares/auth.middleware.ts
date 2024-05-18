import { Request, Response, NextFunction } from "express";
import { ApiError } from "../util/apiError";
import { asyncHandler } from "../util/asyncHandler";
import jwt from "jsonwebtoken";
import { User } from "../models/user/user.model";


export const verifyJWT = asyncHandler(
  async (req: Request , res: Response, next: NextFunction) => {

    try {

      // console.log(req.headers.authorization.replace("Bearer ", ""))
      const token =
        req.cookies?.accessToken ||
        req.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        throw new ApiError(401, "Unauthorized request");
      }

      const decodedToken: any = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      const user = await User.findById(decodedToken?.userId).select(
        "-password -refreshToken"
      );

      if (!user) {
        throw new ApiError(401, "Invalid Access Token");
      }

      req.user = user;
      next();
    } catch (error: any) {
      throw new ApiError(401, error?.message || "Invalid access token");
    }
  }
);
