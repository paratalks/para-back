import type { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../util/apiResponse";
import { ResponseStatusCode } from "../constants/constants";
import { ApiError } from "../util/apiError";

const dotenv = require("dotenv");
const {
  RtcTokenBuilder,
  RtcRole,
  RtmTokenBuilder,
  RtmRole,
} = require("agora-access-token");


dotenv.config();
const APP_ID = "eb5f647608954a03af5a6d7a97d487b8";
const APP_CERTIFICATE = "72fd281737934b338e41df6769186b38";

export const nocache = (_:Request, resp:Response, next:NextFunction) => {
  resp.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  resp.header("Expires", "-1");
  resp.header("Pragma", "no-cache");
  next();
};

export const ping = (req:Request, resp:Response) => {
  resp.send({ message: "pong" });
};

export const generateRTCToken = (req:Request, resp:Response) => {
 try{ // set response header
  resp.header("Access-Control-Allow-Origin", "*");
  // get channel name
  const channelName = "video";

  // get uid
  let uid = 0;

  // get role
  let role = RtcRole.PUBLISHER;

  // get the expire time
  let expireTime = 3600;

  // calculate privilege expire time
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;
  // build the token
  let token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channelName,
    uid,
    role,
    privilegeExpireTime
  );
  // return the token
  return resp.json(new ApiResponse(ResponseStatusCode.SUCCESS,{"RtcToken":token}));}
  catch(error){
    throw new ApiError(
      ResponseStatusCode.INTERNAL_SERVER_ERROR,
      error.message || "Internal server error"
    );
  }
};

export const generateRTMToken = (req:Request, resp:Response) => {
  try {
    // set response header
    resp.header("Access-Control-Allow-Origin", "*");

    // get uid
    let uid = req.params.uid;
    if (!uid || uid === "") {
      return resp.status(400).json({ error: "uid is required" });
    }
    // get role
    let role = RtmRole.Rtm_User;
    // get the expire time
    let reqexpireTime = req.query.expiry;
    let expireTime: number;
    if (!reqexpireTime || reqexpireTime === "") {
      expireTime = 3600;
    }
    //   else {
    //     expireTime = parseInt(expireTime, 10);
    //   }
    // calculate privilege expire time
    const currentTime = Math.floor(Date.now() / 1000);
    const privilegeExpireTime = currentTime + expireTime;
    // build the token
    console.log(APP_ID, APP_CERTIFICATE, uid, role, privilegeExpireTime);
    const token = RtmTokenBuilder.buildToken(
      APP_ID,
      APP_CERTIFICATE,
      uid,
      role,
      privilegeExpireTime
    );
    // return the token
    return resp.json(new ApiResponse(ResponseStatusCode.SUCCESS, { "RtmToken": token }));
  } catch (error) {
    throw new ApiError(
      ResponseStatusCode.INTERNAL_SERVER_ERROR,
      error.message || "Internal server error"
    );
  }
};

export const generateRTEToken = (req:Request, resp:Response) => {
  try{// set response header
  // resp.header("Access-Control-Allow-Origin", "*");
  // get channel name
  const channelName = req.params.channel;
  if (!channelName) {
    return resp.status(400).json({ error: "channel is required" });
  }
  // get uid
  let uid = req.params.uid;
  if (!uid || uid === "") {
    return resp.status(400).json({ error: "uid is required" });
  }
  // get role
  let role;
  if (req.params.role === "publisher") {
    role = RtcRole.PUBLISHER;
  } else if (req.params.role === "audience") {
    role = RtcRole.SUBSCRIBER;
  } else {
    return resp.status(400).json({ error: "role is incorrect" });
  }
  // get the expire time
  let reqexpireTime = req.query.expiry;
  let expireTime:number;
  if (!reqexpireTime || reqexpireTime === "") {
    expireTime = 3600;
  } 
//   else {
//     expireTime = parseInt(expireTime, 10);
//   }
  // calculate privilege expire time
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;
  // build the token
  const rtcToken = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channelName,
    uid,
    role,
    privilegeExpireTime
  );
  const rtmToken = RtmTokenBuilder.buildToken(
    APP_ID,
    APP_CERTIFICATE,
    uid,
    role,
    privilegeExpireTime
  );
  // return the token
  return resp.json(new ApiResponse(ResponseStatusCode.SUCCESS, { "RtcToken": rtcToken, "RtmToken": rtmToken }));
  } catch (error) {
    throw new ApiError(
      ResponseStatusCode.INTERNAL_SERVER_ERROR,
      error.message || "Internal server error"
    )
};
}


