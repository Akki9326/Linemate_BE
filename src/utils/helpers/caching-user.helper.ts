import { CacheService } from "../../services/cache.service";



export const UserCaching = {
    async getSessions(email: string): Promise<any[]> {

        const sessions: any[] = await CacheService.instance.getJson(email)
        return sessions
    },

    async getActiveSessions(email: string): Promise<any[]> {

        const sessionsPromise: Promise<any[]> = UserCaching.getSessions(email)
        const sessions: any[] = await sessionsPromise;

        if (sessions?.length) {
            const activeSessions = sessions.filter(f => f["expiry"] > new Date())

            return activeSessions
        }
        return []
    },

    async pushSession(email: string, sessionArr: any[]) {

        CacheService.instance.setJson(email, sessionArr)

    },

    async isValidSession(email: string, sessionId: string): Promise<boolean> {
        const sessionsPromise: Promise<any[]> = UserCaching.getSessions(email)
        const sessions: any[] = await sessionsPromise;

        if (sessions?.length) {

            const isValidSession = sessions.filter(f => f["sessionId"] == sessionId)

            if (isValidSession[0]?.["expiry"] > new Date().getTime()) {
                return true;
            }
        }

        return false
    },

    async deleteAllSessions(email: string) {

        CacheService.instance.setJson(email, [])
    },

    async deleteParticularSession(email: string, sessionId: string) {
        const sessionsPromise: Promise<any[]> = UserCaching.getSessions(email)
        const sessions: any[] = await sessionsPromise;

        if (sessions?.length) {
            const updatedSessions = sessions.filter(f => f["sessionId"] != sessionId);

            await CacheService.instance.setJson(email, updatedSessions)

            return true

        }

        return false
    }
}