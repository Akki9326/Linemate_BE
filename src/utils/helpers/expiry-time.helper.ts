export const ExpiryTime = {
    forgetPassword: (timeInMinutes: number) => {
        let currentTimeInNumbers = new Date().getTime()
        let expireTime = currentTimeInNumbers + (timeInMinutes * 60000);
        return expireTime
    },
    sessionExpiry: (timeInMinutes: number) => {
       return ExpiryTime.forgetPassword(timeInMinutes)
    }
}