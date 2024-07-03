import { REDIS_HOST } from "@/config";
import { createClient } from "redis";

export class CacheService {

    private client: any;
    private constructor(private redisUrl: string) {
        this.client = createClient({
            url: redisUrl
        });
    }

    private static _instance: CacheService;

    static get instance() {
        if (!this._instance)
            this._instance = new CacheService(REDIS_HOST);

        return this._instance;
    }

    public async connect() {
        await this.client.connect();
    }

    public async getJson<T>(key: string): Promise<T> {
        const dataString = await this.client.get(key);
        if (dataString)
            return JSON.parse(dataString) as T;
        else
            return null;
    }

    public async setJson<T>(key: string, value: T, config?: any): Promise<void> {
        await this.client.set(key, JSON.stringify(value), config);
    }


    public async getString(key: string): Promise<string> {
        const dataString = await this.client.get(key);
        return dataString;
    }

    public async setString(key: string, value: string, config: any): Promise<void> {
        await this.client.set(key, value, config);
    }

    public async delete(key: string) {
        await this.client.del(key);
    }
}