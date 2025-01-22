import { Request, Response, NextFunction, RequestHandler } from "express";
import { ApiError } from "../util/apiError";
import { ApiResponse } from "../util/apiResponse";
import { ResponseStatusCode } from "../constants/constants";
import { Upload } from "../models/uploads/upload.model";


export const getUploads: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {  
    try {
      const page = parseInt(req.query.page as string) || 1; 
    const limit = parseInt(req.query.limit as string) || 10; 
    const skip = (page - 1) * limit;
      

      const uploads = await Upload.find().skip(skip).limit(limit);
      
      const total = await Upload.countDocuments();

      
  
      return res.json(
        new ApiResponse(
          ResponseStatusCode.SUCCESS,
          {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            uploads,
          },
          "video shows sucessfull"
        )
      );
      
    } catch (error) {
      next(
        new ApiError(
          ResponseStatusCode.INTERNAL_SERVER_ERROR,
          error.message || "Failure in fetching Youtube Vidoes"
        )
      );
    }
  };
  

  