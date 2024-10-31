import { logger } from '@/utils/services/logger';
import { CREDENTIALS, NODE_ENV, ORIGIN, PORT } from '@config';
import errorMiddleware from '@middlewares/error.middleware';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import path from 'path';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { AppLiquibase } from './config/liquibase/liquibase.config';
import { Routes } from './models/interfaces/routes.interface';
import { CacheService } from './services/cache.service';
import fileUpload from 'express-fileupload';
import 'reflect-metadata';
import cron from 'node-cron';
import DB from '@/databases';
import { IntervalUnitType, TriggerType } from './models/enums/campaign.enums';
import { CampaignService } from '@/services/campaign.service';

class App {
	public app: express.Application;
	public env: string;
	public port: string | number;
	private routes: Routes[];

	private campaignMaster = DB.CampaignMaster;
	private campaignMatrix = DB.CampaignMatrix;
	private campaignUserMatrix = DB.CampaignUserMatrix;
	private campaignTriggerMatrix = DB.CampaignTriggerMatrix;
	public campaignService = new CampaignService();

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
		// DB.sequelizeConnect.sync({ force: false });

		await AppLiquibase.initialize();
	}

	private initializeMiddlewares() {
		this.app.use(cors({ origin: ORIGIN, credentials: CREDENTIALS }));
		//To Protect against http parameter pollution
		this.app.use(hpp());
		//To Add HTTP Security Headers
		this.app.use(helmet());
		this.app.use(express.static(path.resolve('./public')));
		//
		this.app.use(compression());
		this.app.use(express.json());
		this.app.use(express.urlencoded({ extended: true }));
		this.app.use(fileUpload());
	}

	private initializeRoutes(routes: Routes[]) {
		routes.forEach(route => {
			this.app.use('/', route.router);
		});
	}

	private initializeSwagger() {
		const options = {
			swaggerDefinition: {
				openapi: '3.0.1',
				info: {
					title: 'REST API',
					version: '1.0.0',
					description: 'API docs',
				},
				servers: [
					{
						url: 'http://localhost:3000',
						description: 'Local development server',
					},
					{
						url: 'https://api.stg.portal.linemate.ai',
						description: 'Staging server',
					},
				],
				components: {
					securitySchemes: {
						BearerAuth: {
							type: 'http',
							scheme: 'bearer',
							bearerFormat: 'JWT',
							description: 'Enter your token with "Bearer " prefix. Example: **Bearer <token>**',
						},
					},
				},
				security: [
					{
						BearerAuth: [],
					},
				],
			},
			apis: ['src/config/swagger/swagger.yaml'],
		};

		const specs = swaggerJSDoc(options);

		// Serve the Swagger UI
		this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

		// Serve the OpenAPI specification file
		this.app.get('/api-docs/swagger.yaml', (req, res) => {
			res.sendFile(path.join(__dirname, 'config/swagger/swagger.yaml'));
		});

		// Schedule a task to run every 24 hours
		cron.schedule('0 0 * * *', async next => {
			interface ReoccurenceDetails {
				repeatEvery: number;
				intervalTimeUnit: string;
				afterOccurences: number;
				startDate: Date;
				endDate: Date;
				time: string;
			}

			function getDifferenceInDays(date1: string, date2: string): number {
				// Parse the date strings into Date objects
				const d1 = new Date(date1);
				const d2 = new Date(date2);

				// Get the time difference in milliseconds
				const timeDifference = d1.getTime() - d2.getTime();

				// Convert the time difference from milliseconds to days
				const differenceInDays = timeDifference / (1000 * 60 * 60 * 24);

				// Return the absolute value of the difference (so it’s always positive)
				return Math.abs(Math.floor(differenceInDays));
			}

			function getDifferenceInWeeks(date1: string, date2: string): number {
				// Parse the date strings into Date objects
				const d1 = new Date(date1);
				const d2 = new Date(date2);

				// Get the time difference in milliseconds
				const timeDifference = d1.getTime() - d2.getTime();

				// Convert the time difference from milliseconds to weeks
				const differenceInWeeks = timeDifference / (1000 * 60 * 60 * 24 * 7);

				// Return the absolute value of the full weeks
				return Math.abs(Math.floor(differenceInWeeks));
			}

			function getDifferenceInMonths(date1: string, date2: string): number {
				// Parse the date strings into Date objects
				const d1 = new Date(date1);
				const d2 = new Date(date2);

				// Calculate the year and month difference
				const yearDifference = d1.getFullYear() - d2.getFullYear();
				const monthDifference = d1.getMonth() - d2.getMonth();

				// Total difference in months
				const totalMonths = yearDifference * 12 + monthDifference;

				// Return the absolute value of the full months
				return Math.abs(totalMonths);
			}

			const campaignList = await this.campaignMaster.findAll({
				where: {
					isDeleted: true,
				},
			});

			for (const campaign of campaignList) {
				// Check if reoccurenceDetails exist and cast it to the correct type
				const reoccurenceDetails = campaign.reoccurenceDetails as ReoccurenceDetails;

				if (reoccurenceDetails && reoccurenceDetails.startDate >= new Date()) {
					next();
				}

				if (reoccurenceDetails && reoccurenceDetails.endDate <= new Date()) {
					next();
				}

				if (reoccurenceDetails.startDate == new Date()) {
					await this.campaignService.automaticFiredCampaign(campaign.id);
				}

				if (reoccurenceDetails.intervalTimeUnit == IntervalUnitType.day) {
					const lastTrigerInfo = await DB.CampaignTriggerMatrix.findAll({
						where: {
							campaignId: campaign.id,
							fireType: TriggerType.automatic,
							isFired: true,
						},
						order: [['id', 'DESC']],
					});
					if (lastTrigerInfo.length == reoccurenceDetails.afterOccurences) {
						next();
					}
					const lastTriger = lastTrigerInfo[0];
					const lastTrigerDate = String(lastTriger.firedOn);
					const dayDifference = getDifferenceInDays(lastTrigerDate, String(new Date()));
					if (dayDifference == reoccurenceDetails.repeatEvery) {
						await this.campaignService.automaticFiredCampaign(campaign.id);
					}
				}

				if (reoccurenceDetails.intervalTimeUnit == IntervalUnitType.week) {
					const lastTrigerInfo = await DB.CampaignTriggerMatrix.findAll({
						where: {
							campaignId: campaign.id,
							fireType: TriggerType.automatic,
							isFired: true,
						},
						order: [['id', 'DESC']],
					});
					if (lastTrigerInfo.length == reoccurenceDetails.afterOccurences) {
						next();
					}
					const lastTriger = lastTrigerInfo[0];
					const lastTrigerDate = String(lastTriger.firedOn);
					const dayDifference = getDifferenceInWeeks(lastTrigerDate, String(new Date()));
					if (dayDifference == reoccurenceDetails.repeatEvery) {
						await this.campaignService.automaticFiredCampaign(campaign.id);
					}
				}

				if (reoccurenceDetails.intervalTimeUnit == IntervalUnitType.month) {
					const lastTrigerInfo = await DB.CampaignTriggerMatrix.findAll({
						where: {
							campaignId: campaign.id,
							fireType: TriggerType.automatic,
						},
						order: [['id', 'DESC']],
					});
					if (lastTrigerInfo.length == reoccurenceDetails.afterOccurences) {
						next();
					}
					const lastTriger = lastTrigerInfo[0];
					const lastTrigerDate = String(lastTriger.firedOn);
					const dayDifference = getDifferenceInMonths(lastTrigerDate, String(new Date()));
					if (dayDifference == reoccurenceDetails.repeatEvery) {
						await this.campaignService.automaticFiredCampaign(campaign.id);
					}
				}
			}
		});
	}

	private initializeErrorHandling() {
		this.app.use(errorMiddleware);
	}
	private initiateProcessErrorHandler() {
		process.on('uncaughtException', err => {
			logger.error(`Uncaught Exception ${err.name}: ${err.message}:: stack: ${err.stack}`);
		});
		process.on('unhandledRejection', (err: Error) => {
			logger.error(`Unhandled Rejection`);
			let message = '';
			if (typeof err == 'object') message = JSON.stringify(err);
			else message = err as string;
			logger.error(`Rejection message: ${message}:: stack: ${err.stack}`);
		});
	}

	private async initializeSingletons() {
		await CacheService.instance.connect();
	}
}

export default App;
