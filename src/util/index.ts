export enum Status {
    ACTIVE = "active",
    INACTIVE="inactive"
}
export enum Role {
    USER = "user",
    ADMIN = "admin",
    PARA_EXPERT = "paraExpert"
}
export enum BookingType {
    CHAT = "chat",
    VIDEO_CALL = "video_call",
    AUDIO_CALL = "audio_call",
    OFFLINE_PACKAGE = "offline"
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