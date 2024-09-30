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
	SESSION_EXPIRY_MINS,
	SECRET_KEY,
	LOG_DIR,
	ORIGIN,
	SMTP_HOST,
	SMTP_PORT,
	SMTP_USER,
	SMTP_PASS,
	SMTP_FROM,
	REDIS_HOST,
	WEB_APP_URL,
	DB_LIQUIBASE_PATH,
	TOKEN_EXPIRY,
	OTP_EXPIRY,
	MAX_CHIEF,
	FRONTEND_URL,
	BACKEND_URL,
	AWS_SECRET_ACCESS_KEY,
	AWS_ACCESS_KEY_ID,
	AWS_REGION,
	BUCKET,
	AWS_S3_FILE_URL,
	FYNO_BASE_URL,
	FYNO_AUTH_TOKEN,
	FYNO_WHATSAPP_INTEGRATION_ID,
	FYNO_WHATSAPP_PROVIDER_ID,
	FYNO_WHATSAPP_WORKSPACE_ID,
	FYNO_WHATSAPP_CUSTOM_NAME,
	FYNO_WHATSAPP_PROVIDER_NAME,
} = process.env;
