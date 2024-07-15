import { cleanEnv, num, port, str } from 'envalid';

function validateEnv() {
	cleanEnv(
		process.env,
		{
			NODE_ENV: str(),
			PORT: port(),
			DB_HOST: str(),
			DB_PORT: port(),
			DB_USER: str(),
			DB_PASSWORD: str(),
			DB_DATABASE: str(),
			SECRET_KEY: str(),
			LOG_FORMAT: str(),
			LOG_DIR: str(),
			ORIGIN: str(),
			CREDENTIALS: str(),
			SMTP_FROM: str(),
			SMTP_HOST: str(),
			SMTP_PASS: str(),
			SMTP_USER: str(),
			SMTP_PORT: num(),
			AWS_SECRET_ACCESS_KEY: str(),
			AWS_ACCESS_KEY_ID: str(),
			AWS_REGION: str(),
			BUCKET: str(),
			SESSION_EXPIRY_MINS: num(),
		},
		{
			reporter: ({ errors }) => {
				if (errors)
					for (const [envVar, err] of Object.entries(errors)) {
						console.log(envVar, err);
						throw err;
					}
			},
		},
	);
}

export default validateEnv;
