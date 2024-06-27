import { LiquibaseConfig, Liquibase, POSTGRESQL_DEFAULT_CONFIG } from 'liquibase';
import { DB_DATABASE, DB_HOST, DB_LIQUIBASE_PATH, DB_PASSWORD, DB_PORT, DB_USER, } from '..';
import { logger } from '@/utils/services/logger';

export class AppLiquibase {
  static myConfig: LiquibaseConfig = {
    ...POSTGRESQL_DEFAULT_CONFIG,
    liquibase: DB_LIQUIBASE_PATH,
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
      this.liquibaseInstance.update({});
    } catch (err: any) {
      logger.error(err.message);
    }
  }
}
