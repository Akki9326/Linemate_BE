import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { NODE_ENV, PORT, ORIGIN, CREDENTIALS } from '@config';
import errorMiddleware from '@middlewares/error.middleware';
import { logger } from '@/utils/services/logger';
import { AppLiquibase } from './config/liquibase/liquibase.config';
import { Routes } from './models/interfaces/routes.interface';
import { CacheService } from './services/cache.service';
import DB from './databases';

class App {
  public app: express.Application;
  public env: string;
  public port: string | number;
  private routes: Routes[];

  constructor(routes: Routes[]) {
    this.app = express();
    this.env = NODE_ENV || 'development';
    this.port = PORT || 3000;
    this.routes = routes;


  }

  public async init() {

    this.initiateProcessErrorHandler();
    await this.initializeSingletons();
    await this.connectToDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes(this.routes);
    this.initializeSwagger();
    this.initializeErrorHandling();
    this.listen();
  }

  private listen() {
    this.app.listen(this.port, () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 App listening on the port ${this.port}`);
      logger.info(`=================================`);
    });
  }

  public getServer() {

    return this.app;
  }

  private async connectToDatabase() {
    DB.sequelizeConnect.sync({ force: false });

    // await AppLiquibase.initialize();
  }

  private initializeMiddlewares() {

    this.app.use(cors({ origin: ORIGIN, credentials: CREDENTIALS }));
    //To Protect against http parameter pollution
    this.app.use(hpp());
    //To Add HTTP Security Headers
    this.app.use(helmet());
    //
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private initializeRoutes(routes: any[]) {

    routes.forEach(route => {
      this.app.use('/', route.router);
    });
  }

  private initializeSwagger() {

    const options = {
      swaggerDefinition: {
        info: {
          title: 'REST API',
          version: '1.0.0',
          description: ' Api docs',
        },
      },
      apis: ['src/config/swagger/swagger.yaml'],
    };

    const specs = swaggerJSDoc(options);
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  }

  private initializeErrorHandling() {

    this.app.use(errorMiddleware);
  }
  private initiateProcessErrorHandler() {

    process.on('uncaughtException', err => {
      logger.error(`Uncaught Exception ${err.name}: ${err.message}:: stack: ${err.stack}`);
    });
    process.on('unhandledRejection', err => {
      logger.error(`Unhandled Rejection`);
      let message = '';
      if (typeof err == 'object') message = JSON.stringify(err);
      else message = err as string;
      logger.error(`Rejection message: ${message}`);
    });
  }

  private async initializeSingletons() {

    await CacheService.instance.connect();
  }
}

export default App;
