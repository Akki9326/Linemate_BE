export const ExpiryTime = {
	forgetPassword: (timeInMinutes: number) => {
		const currentTimeInNumbers = new Date().getTime();
		const expireTime = currentTimeInNumbers + timeInMinutes * 60000;
		return expireTime;
	},
	sessionExpiry: (timeInMinutes: number) => {
		return ExpiryTime.forgetPassword(timeInMinutes);
	},
};
