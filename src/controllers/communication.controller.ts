import { CommunicationDto } from '@/models/dtos/communication.dto';
import { RequestWithUser } from '@/models/interfaces/auth.interface';
import { CommunicationService } from '@/services/communication.service';
import { AppResponseHelper } from '@/utils/helpers/app-response.helper';
import { NextFunction, Response } from 'express-serve-static-core';

class CommunicationController {
	public communicationService = new CommunicationService();
	public add = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const communicationDetails = req.body as CommunicationDto;
			const userId = req.user.id as number;
			const cohortResponse = await this.communicationService.add(communicationDetails, userId);
			AppResponseHelper.sendSuccess(res, 'Success', cohortResponse);
		} catch (ex) {
			next(ex);
		}
	};
	public update = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const communicationDetails = req.body as CommunicationDto;
			const communicationId = parseInt(req.params.id);
			const userId = req.user.id as number;
			const cohortResponse = await this.communicationService.update(communicationDetails, communicationId, userId);
			AppResponseHelper.sendSuccess(res, 'Success', cohortResponse);
		} catch (ex) {
			next(ex);
		}
	};
	public getByTenantId = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const tenantId = parseInt(req.params.tenantId);
			const channel = req.body.channel;
			const cohortResponse = await this.communicationService.one(tenantId, channel);
			AppResponseHelper.sendSuccess(res, 'Success', cohortResponse);
		} catch (ex) {
			next(ex);
		}
	};
}

export default CommunicationController;
