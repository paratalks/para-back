import { Request, Response, NextFunction } from "express";
import { ApiError } from "../util/apiError";
import { asyncHandler } from "../util/asyncHandler";
import jwt from "jsonwebtoken";
import { User } from "../models/user/user.model";
import { Admin } from "../models/admin/admin.modle";

export const verifyJWT = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token =
        req.cookies?.accessToken ||
        req.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        throw new ApiError(401, "Unauthorized request");
      }

      const decodedToken: any = jwt.verify(token, process.env.JWT_SECRET);

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

export const hasAdminAccess = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token =
      req.cookies?.accessToken ||
      req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    try {
      const decodedToken: any = jwt.verify(token, process.env.JWT_SECRET);

      const user = await Admin.findById(decodedToken?.userId).select(
        "-password -refreshToken"
      );

      if (!user) {
        throw new ApiError(401, "Invalid Access Token");
      }
      req.user = user;
      next();
    } catch (error) {
      throw new ApiError(401, error?.message || "Invalid access token");
    }
  }
);

const validApiKey: string | undefined = process.env.VALID_API_KEY;

export const verifyApiKey = (req: Request, res: Response, next: NextFunction) => {
  try {
    const apiKey = req.headers['para_talks_api_key'] || req.query.para_talks_api_key;

    if (typeof apiKey === 'string' && validApiKey) {
      if (apiKey === validApiKey) {
        return next();
      } else {
        throw new ApiError(403, 'Forbidden: Invalid API key');
      }
    }
    throw new ApiError(401, 'Unauthorized: API key is missing or invalid');
  } catch (error) {
    throw new ApiError(401, error?.message || "Unauthorized Access");
  }
};

