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
      

      const uploads = await Upload.find(); 
      
  
      return res.json(
        new ApiResponse(
          ResponseStatusCode.SUCCESS,
          uploads,
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
  

  