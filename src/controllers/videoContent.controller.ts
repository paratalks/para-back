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
  
  export const getUploadsAdmin: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { videoLinks, createdAt, updatedAt, title, description } = req.body;
      
        const uploadVideo = await Upload.create({
          videoLinks,
          createdAt,
          updatedAt,
          title,
          description
        })
      
      
  
      res.json(
        new ApiResponse(
          200,
         
          "Upload created successfully for admin."
        )
      );
    } catch (error) {
      next(
        new ApiError(
          ResponseStatusCode.INTERNAL_SERVER_ERROR,
          error.message || "Failure in Uploading Videos"
        )
      );
    }
  };
  
  export const getDeleteVideo: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params; 

      if (!id) {
        throw new Error("ID is required");
      }
  
      const deletedItem = await Upload.findByIdAndDelete(id);
  
      if (!deletedItem) {
        return next(
          new ApiError(
            ResponseStatusCode.NOT_FOUND,
            `Item with ID ${id} not found.`
          )
        );
      }
  
      
      
  
      res.json(
        new ApiResponse(
          200,
         
          `Item with ID ${id} deleted successfully.`
        )
      );
    } catch (error) {
      next(
        new ApiError(
          ResponseStatusCode.INTERNAL_SERVER_ERROR,
          error.message || "Failure in Deleting Videos"
        )
      );
    }
  };
  
    export const getUpdateVideo: RequestHandler = async (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const { id, title, description } = req.body; 
        if (!id) {
          throw new Error("ID is required to update the video.");
        }
    
        
        const updatedVideo = await Upload.findByIdAndUpdate(
          id,
          { title, description }, 
          { new: true } 
        );
    
        if (!updatedVideo) {
          return next(
            new ApiError(
              ResponseStatusCode.NOT_FOUND,
              `Video with ID ${id} not found.`
            )
          );
        }
        
    
        res.json(
          new ApiResponse(
            200,
          
            "updated the video field."
          )
        );
      } catch (error) {
        next(
          new ApiError(
            ResponseStatusCode.INTERNAL_SERVER_ERROR,
            error.message || "Failure in Updating Videos "
          )
        );
      }
    };
  