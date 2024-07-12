import * as crypto from 'crypto';

export const TokenGenerator = {
	forgetPasswordToken: () => {
		return crypto.randomBytes(32).toString('hex');
	},
};
