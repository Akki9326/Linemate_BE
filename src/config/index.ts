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
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM,
  REDIS_HOST,
  FORGOT_PASSWORD_LINK_EXP,
  WEB_APP_URL,
  DB_LIQUIBASE_PATH,
  TOKEN_EXPIRY,
  OTP_EXPIRY,
  MAX_CHIEF
} = process.env;
