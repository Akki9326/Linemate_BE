import CountryController from '@/controllers/country.controller';
import { Routes } from '@/models/interfaces/routes.interface';
import { Router } from 'express';


class CountryRoute implements Routes {
    public path = '/country';
    public router = Router();
    public countryController = new CountryController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}/v1/list`, this.countryController.list);
    }
}

export default CountryRoute;
