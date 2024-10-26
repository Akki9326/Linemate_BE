/* eslint-disable @typescript-eslint/no-explicit-any */
import { CacheService } from '../../services/cache.service';

export const UserCaching = {
	async getSessions(sessionName: string): Promise<any[]> {
		const sessions: any[] = await CacheService.instance.getJson(sessionName);
		return sessions;
	},

	async getActiveSessions(sessionName: string): Promise<any[]> {
		const sessionsPromise: Promise<any[]> = UserCaching.getSessions(sessionName);
		const sessions: any[] = await sessionsPromise;

		if (sessions?.length) {
			const activeSessions = sessions.filter(f => f['expiry'] > new Date());
			return activeSessions;
		}
		return [];
	},

	async pushSession(sessionName: string, sessionArr: any[]) {
		CacheService.instance.setJson(sessionName, sessionArr);
	},

	async isValidSession(sessionName: string, sessionId: string): Promise<boolean> {
		const sessionsPromise: Promise<any[]> = UserCaching.getSessions(sessionName);
		const sessions: any[] = await sessionsPromise;

		if (sessions?.length) {
			const isValidSession = sessions.filter(f => f['sessionId'] == sessionId);

			if (isValidSession[0]?.['expiry'] > new Date().getTime()) {
				return true;
			}
		}

		return false;
	},

	async deleteAllSessions(sessionName: string) {
		CacheService.instance.setJson(sessionName, []);
	},

	async deleteParticularSession(sessionName: string, sessionId: string) {
		const sessionsPromise: Promise<any[]> = UserCaching.getSessions(sessionName);
		const sessions: any[] = await sessionsPromise;

		if (sessions?.length) {
			const updatedSessions = sessions.filter(f => f['sessionId'] != sessionId);

			await CacheService.instance.setJson(sessionName, updatedSessions);

			return true;
		}

		return false;
	},
};
