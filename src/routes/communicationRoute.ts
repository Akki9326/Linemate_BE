import CommunicationController from '@/controllers/communication.controller';
import authMiddleware from '@/middlewares/auth.middleware';
import validationMiddleware from '@/middlewares/validation.middleware';
import { CommunicationDto } from '@/models/dtos/communication.dto';
import { Routes } from '@/models/interfaces/routes.interface';
import { Router } from 'express';

class CommunicationRoute implements Routes {
	public path = '/communication';
	public router = Router();
	public communicationController = new CommunicationController();

	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.post(`${this.path}/v1/add`, authMiddleware, validationMiddleware(CommunicationDto, 'body'), this.communicationController.add);
		this.router.post(`${this.path}/v1/:id`, authMiddleware, validationMiddleware(CommunicationDto, 'body'), this.communicationController.update);
	}
}

export default CommunicationRoute;
