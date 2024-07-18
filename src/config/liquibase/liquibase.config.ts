import { logger } from '@/utils/services/logger';
import { Liquibase, LiquibaseConfig, POSTGRESQL_DEFAULT_CONFIG } from 'liquibase';
import { DB_DATABASE, DB_HOST, DB_PASSWORD, DB_PORT, DB_USER } from '..';

export class AppLiquibase {
	static myConfig: LiquibaseConfig = {
		...POSTGRESQL_DEFAULT_CONFIG,
		liquibase: process.env.DB_LIQUIBASE_PATH,
		url: `jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_DATABASE}`,
		username: DB_USER,
		password: DB_PASSWORD,
		classpath: './db/postgresql-42.3.3.jar',
		changeLogFile: './db/changelog.xml',
	};
	static liquibaseInstance: Liquibase;

	static async initialize() {
		try {
			this.liquibaseInstance = new Liquibase(this.myConfig);
			await this.liquibaseInstance.update({});
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (err: any) {
			logger.error(err.message);
		}
	}
}
