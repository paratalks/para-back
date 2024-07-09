import multer from "multer";
import crypto from "crypto";

import { uploadFile, deleteFile, getObjectSignedUrl } from "../util/fileUpload";
import { asyncHandler } from "../util/asyncHandler";
import { Request, Response } from "express";
import { ApiResponse } from "../util/apiResponse";
import { ResponseStatusCode } from "../constants/constants";

export const postImage = asyncHandler(async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const imageName = crypto.randomBytes(32).toString("hex");

    const url = await uploadFile(file.buffer, imageName, file.mimetype);
    if (!url) {
      return res.json(new ApiResponse(ResponseStatusCode.BAD_REQUEST, "can't upload image"));
    }
    return res.json(new ApiResponse(ResponseStatusCode.SUCCESS, imageName));
  } catch (error) {
    res.json(
      new ApiResponse(ResponseStatusCode.INTERNAL_SERVER_ERROR, error?.message)
    );
  }
});

export const getImage = asyncHandler(async (req: Request, res: Response) => {
  try {
    const imageName = req.params.imageName;
    const url = await getObjectSignedUrl(imageName);
    if (!url) {
      return res.json(
        new ApiResponse(ResponseStatusCode.BAD_REQUEST, "can't find image")
      );
    }
    return res.json(new ApiResponse(ResponseStatusCode.SUCCESS, url));
  } catch (error) {
    res.json(
      new ApiResponse(ResponseStatusCode.INTERNAL_SERVER_ERROR, error?.message)
    );
  }
});

export const deleteImage = asyncHandler(async (req: Request, res: Response) => {
  try {
    const imageName = req.params.imageName;
    const result = await deleteFile(imageName);    
    if (!result) {
      return res.json(
        new ApiResponse(ResponseStatusCode.BAD_REQUEST, "can't find image")
      );
    }
    return res.json(new ApiResponse(ResponseStatusCode.SUCCESS, result));
  } catch (error) {
    res.json(
      new ApiResponse(ResponseStatusCode.INTERNAL_SERVER_ERROR, error?.message)
    );
  }
});
