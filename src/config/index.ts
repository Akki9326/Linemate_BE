import { config } from 'dotenv';
config({ path: `src/config/envs/.env` });

export const CREDENTIALS = process.env.CREDENTIALS === 'true';
export const {
  NODE_ENV,
  PORT,
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_DATABASE,
  SECRET_KEY,
  LOG_DIR,
  ORIGIN,
  OTP_EXPIRY,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM,
  REDIS_HOST,
  FORGOT_PASSWORD_LINK_EXP,
  WEB_APP_URL,
  DB_LIQUIBASE_PATH,
  MAX_SESSION_COUNT,
  SESSION_EXPIRY_MINS,
  PRIMARY_ROLE_ID,
  L1_ROLE_ID,
  L2_ROLE_ID,
  SALEFORCE_TOKEN_USERNAME,
  SALEFORCE_TOKEN_PASSWORD,
  SALEFORCE_TOKEN_GRANT_TYPE,
  SALEFORCE_TOKEN_CLIENT_ID,
  SALEFORCE_TOKEN_CLIENT_SECRET,
  SALEFORCE_TOKEN_URL,
  SALEFORCE_CLIENT_DETAILS_URL,
  SALESFORCE_REQ_PAGESIZE,
  ADMIN_EMAIL
  

} = process.env;
