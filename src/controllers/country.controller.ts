import { CountryService } from '@/services/country.service'
import { AppResponseHelper } from '@/utils/helpers/app-response.helper';
import { NextFunction, Request, Response } from 'express-serve-static-core';

class countryController {
    public countryService = new CountryService();

    public list = async (req: Request, res: Response, next: NextFunction) => {
        try {
            let pageModel = req.query
            const countryResponse = await this.countryService.list(pageModel);
            AppResponseHelper.sendSuccess(res, 'Success', countryResponse);
        }
        catch (ex) {
            next(ex)
        }
    };
}

export default countryController;
