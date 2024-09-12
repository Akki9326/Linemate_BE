import ViberController from '@/controllers/viber.controller';
import { Routes } from '@/models/interfaces/routes.interface';
import { Router } from 'express';

class ViberRoute implements Routes {
	public path = '/viber';
	public router = Router();
	public ViberController = new ViberController();

	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.post(`/cb${this.path}/dlr`, this.ViberController.dlr);
		this.router.post(`/cb${this.path}/incmng`, this.ViberController.incmng);
	}
}

export default ViberRoute;
