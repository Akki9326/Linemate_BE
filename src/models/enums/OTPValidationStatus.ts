export enum OTPValidationStatus {
    Success = 1,
    Expired = 2,
    Invalid = 3
}

export enum TokenTypes {
    LOGIN_OTP = 'LOGIN_OTP',
    FORGOT_PASSWORD = 'FORGOT_PASSWORD',
};