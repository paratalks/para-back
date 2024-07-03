export enum Status {
    ACTIVE = "active",
    INACTIVE="inactive"
}
export enum BookingType {
    VIDEO_CALL = "video_call",
    AUDIO_CALL = "audio_call",
    ONLINE_PACKAGE = "online_package",
    OFFLINE_PACKAGE = "offline_package"
}
export enum PaymentStatus {
    PENDING = "pending",
    SUCCESS = "success",
    FAILED = "failed"
}

export enum StatusCode {
    OK = 200,
    NOT_FOUND=404,
    SERVER_ERROR=500,
    BAD_REQ=400
}