import { RtcRole, RtcTokenBuilder } from "agora-access-token";

const APP_ID = "eb5f647608954a03af5a6d7a97d487b8";
const APP_CERTIFICATE = "72fd281737934b338e41df6769186b38";

export const generateRtcToken =()=>{
    const channelName = "video";

    // get uid
    let uid = 0;

    // get role
    let role = RtcRole.PUBLISHER;

    // get the expire time
    let expireTime = 7*24*3600;

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

    return token;
}