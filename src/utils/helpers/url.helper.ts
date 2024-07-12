import { WEB_APP_URL } from '@/config';

export const UrlHelper = {
	resetPasswordUrl: token => `${WEB_APP_URL}/auth/reset-password?token=${token}`,
	activateAccountUrl: token => `${WEB_APP_URL}/auth/account-activation?token=${token}`,
};
