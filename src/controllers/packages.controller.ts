import { Request, Response } from "express";
import { ApiError } from "../util/apiError";
import { asyncHandler } from "../util/asyncHandler";
import { User } from "../models/user/user.model";
import { ParaExpert } from "../models/paraExpert/paraExpert.model";
import { ApiResponse } from "../util/apiResponse";
import { ResponseStatusCode } from "../constants/constants";
import { IPackage } from "../models/paraExpert/paraExpert.types";

export const createExpertPackages = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const user = req.user;
      const userId = user._id;
      const paraExpert = await ParaExpert.findOne({ userId });
      if (!paraExpert) {
        throw new ApiError(
          ResponseStatusCode.NOT_FOUND,
          "Para Expert Not Founded"
        );
      }
      const {
        priority,
        title,
        type,
        description,
        minamount,
        maxamount,
        services,
        additional,
        packageDuration,
      } = req.body;
      const expert = await ParaExpert.findById(paraExpert._id);

      const packageIndex = expert.packages.findIndex(
        (pkg) => pkg.title === title
      );
      if (packageIndex === -1) {
        expert.packages.push({
          priority,
          title,
          type,
          description,
          minamount,
          maxamount,
          services,
          additional,
          packageDuration,
        });
      } else {
        expert.packages[packageIndex] = {
          priority,
          title,
          type,
          description,
          minamount,
          maxamount,
          services,
          additional,
          packageDuration,
        };
      }
      const updatedParaExpert = await expert.save();
      return res.json(
        new ApiResponse(
          ResponseStatusCode.SUCCESS,
          updatedParaExpert.packages,
          "Created ParaExpert packages successfully"
        )
      );
    } catch (error) {
      throw new ApiError(
        ResponseStatusCode.INTERNAL_SERVER_ERROR,
        error.message || "Internal server error"
      );
    }
  }
);

export const getPackageById = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const user = req.user;
      const userId = user._id;
      const { packageId } = req.params;

      const paraExpert = await ParaExpert.findOne({ userId });
      if (!paraExpert) {
        throw new ApiError(
          ResponseStatusCode.NOT_FOUND,
          "Para Expert Not Found"
        );
      }

      const packageIndex = paraExpert.packages.findIndex(
        (pkg: IPackage) => pkg._id?.toString() === packageId
      );
      if (packageIndex === -1) {
        throw new ApiError(ResponseStatusCode.NOT_FOUND, "Package Not Found");
      }

      const pkg = paraExpert.packages[packageIndex];
      return res.json(
        new ApiResponse(
          ResponseStatusCode.SUCCESS,
          pkg,
          "Fetched Package successfully"
        )
      );
    } catch (error) {
      throw new ApiError(
        ResponseStatusCode.INTERNAL_SERVER_ERROR,
        error.message || "Internal server error"
      );
    }
  }
);

export const getExpertPackages = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const user = req.user;
      const userId = user._id;
      const paraExpert = await ParaExpert.findOne({ userId });
      if (!paraExpert) {
        throw new ApiError(
          ResponseStatusCode.NOT_FOUND,
          "Para Expert Not Found"
        );
      }
      const packages = paraExpert.packages;

      return res.json(
        new ApiResponse(
          ResponseStatusCode.SUCCESS,
          packages,
          "Fetched ParaExpert packages successfully"
        )
      );
    } catch (error) {
      throw new ApiError(
        ResponseStatusCode.INTERNAL_SERVER_ERROR,
        error.message || "Internal server error"
      );
    }
  }
);

export const updatePackageById = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const user = req.user;
      const userId = user._id;
      const { packageId } = req.params;

      const paraExpert = await ParaExpert.findOne({ userId });
      if (!paraExpert) {
        throw new ApiError(
          ResponseStatusCode.NOT_FOUND,
          "Para Expert Not Found"
        );
      }

      const packageIndex = paraExpert.packages.findIndex(
        (pkg: IPackage) => pkg._id?.toString() === packageId
      );
      if (packageIndex === -1) {
        throw new ApiError(ResponseStatusCode.NOT_FOUND, "Package Not Found");
      }
      const {
        priority,
        title,
        type,
        description,
        minamount,
        maxamount,
        services,
        additional,
        packageDuration,
      } = req.body;

      paraExpert.packages[packageIndex] = {
        ...paraExpert.packages[packageIndex],
        ...(priority !== undefined && { priority }),
        ...(title !== undefined && { title }),
        ...(type !== undefined && { type }),
        ...(description !== undefined && { description }),
        ...(minamount !== undefined && { minamount }),
        ...(maxamount !== undefined && { maxamount }),
        ...(services !== undefined && { services }),
        ...(additional !== undefined && { additional }),
        ...(packageDuration !== undefined && { packageDuration }),
      };

      const updatedParaExpert = await paraExpert.save();
      const updatedPackage = updatedParaExpert.packages[packageIndex];

      return res.json(
        new ApiResponse(
          ResponseStatusCode.SUCCESS,
          updatedPackage,
          "Updated Package successfully"
        )
      );
    } catch (error) {
      throw new ApiError(
        ResponseStatusCode.INTERNAL_SERVER_ERROR,
        error.message || "Internal server error"
      );
    }
  }
);

export const deletePackageById = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const user = req.user;
      const userId = user._id;
      const { packageId } = req.params;

      // Find the ParaExpert document by userId
      const paraExpert = await ParaExpert.findOne({ userId });
      if (!paraExpert) {
        throw new ApiError(
          ResponseStatusCode.NOT_FOUND,
          "Para Expert Not Found"
        );
      }

      // Find the index of the package to delete
      const packageIndex = paraExpert.packages.findIndex(
        (pkg: IPackage) => pkg._id?.toString() === packageId
      );
      if (packageIndex === -1) {
        throw new ApiError(ResponseStatusCode.NOT_FOUND, "Package Not Found");
      }

      // Remove the package from the array
      paraExpert.packages.splice(packageIndex, 1);

      // Save the updated ParaExpert document
      const updatedParaExpert = await paraExpert.save();

      return res.json(
        new ApiResponse(
          ResponseStatusCode.SUCCESS,
          updatedParaExpert.packages,
          "Deleted Package successfully"
        )
      );
    } catch (error) {
      throw new ApiError(
        ResponseStatusCode.INTERNAL_SERVER_ERROR,
        error.message || "Internal server error"
      );
    }
  }
);
