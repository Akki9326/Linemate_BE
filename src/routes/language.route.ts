import LanguageController from '@/controllers/language.controller';
import { Routes } from '@/models/interfaces/routes.interface';
import { Router } from 'express';

class LanguageRoute implements Routes {
	public path = '/language';
	public router = Router();
	public LanguageController = new LanguageController();

	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.get(`${this.path}/v1/list`, this.LanguageController.list);
	}
}

export default LanguageRoute;
