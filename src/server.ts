
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
import UserTypeRoute from './routes/userType.route';
import RoleRoute from './routes/role.route';
import PermissionRoute from './routes/permissions.route';
import UserRoute from './routes/user.route';


validateEnv();

const app = new App([new IndexRoute(), new AuthRoute(), new UserTypeRoute(),  new PermissionRoute(), new RoleRoute(),new UserRoute()]);

app.init();

