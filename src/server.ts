
process.on('uncaughtException', err => {
    console.error(`Uncaught Exception ${err.name}: ${err.message}:: stack: ${err.stack}`);
  });
  process.on('unhandledRejection', err => {
    console.error(`Unhandled Rejection`);
    let message = '';
    if (typeof err == 'object') message = JSON.stringify(err);
    else message = err as string;
    console.error(`Rejection message: ${message}`);
  });

import App from '@/app';
import validateEnv from '@/utils/services/validateEnv';
import AuthRoute from '@routes/auth.route';
import IndexRoute from '@routes/index.route';


validateEnv();

const app = new App([new IndexRoute(), new AuthRoute()]);

app.init();

