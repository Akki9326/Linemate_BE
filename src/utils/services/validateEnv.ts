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
      SMTP_PORT: num()
    },
    {
      reporter: ({ errors, env }) => {
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
