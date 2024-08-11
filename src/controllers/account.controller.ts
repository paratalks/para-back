import { Request, Response } from "express";
import { Account } from "../models/account/account.model";
import { ApiResponse } from "../util/apiResponse";
import { ResponseStatusCode } from "../constants/constants";

export const createAccount = async (req: Request, res: Response) => {
  try {
    const { expertId } = req.params;

    const {
      accountHolderName,
      accountNumber,
      branchName,
      ifscCode,
      bankName,
    } = req.body;

    if (
      !expertId ||
      !accountHolderName ||
      !accountNumber ||
      !ifscCode ||
      !bankName
    ) {
      return res.status(400).json(
        new ApiResponse(
          ResponseStatusCode.BAD_REQUEST,
          null,
          "Please provide all required fields"
        )
      );
    }

    const newAccount = new Account({
      paraExpertId:expertId,
      accountHolderName,
      accountNumber,
      branchName,
      ifscCode: ifscCode.toUpperCase(),
      bankName,
    });

    const savedAccount = await newAccount.save();

    res.status(201).json(
      new ApiResponse(
        ResponseStatusCode.SUCCESS,
        savedAccount,
        "Account created successfully"
      )
    );
  } catch (error) {
    res.status(500).json(
      new ApiResponse(
        ResponseStatusCode.INTERNAL_SERVER_ERROR,
        null,
        "Error creating account"
      )
    );
  }
};

export const updateAccount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedAccount = await Account.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true, 
    });

    if (!updatedAccount) {
      return res.status(404).json(
        new ApiResponse(
          ResponseStatusCode.NOT_FOUND,
          null,
          "Account not found"
        )
      );
    }

    res.status(200).json(
      new ApiResponse(
        ResponseStatusCode.SUCCESS,
        updatedAccount,
        "Account updated successfully"
      )
    );
  } catch (error) {
    res.status(500).json(
      new ApiResponse(
        ResponseStatusCode.INTERNAL_SERVER_ERROR,
        null,
        "Error updating account"
      )
    );
  }
};
