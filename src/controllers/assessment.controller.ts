import { questionData } from '@/models/dtos/assessment.dto';
import { RequestWithUser } from '@/models/interfaces/auth.interface';
import AssessmentServices from '@/services/assessment.service';
import { AppResponseHelper } from '@/utils/helpers/app-response.helper';
import { NextFunction, Response } from 'express-serve-static-core';

class AssessmentController {
	public AssessmentServices = new AssessmentServices();

	public uploadQuestion = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const contentId = parseInt(req.params.id);
			const questionData: questionData[] = req.body.questions;
			const assessmentResponse = await this.AssessmentServices.uploadQuestion(contentId, questionData);
			AppResponseHelper.sendSuccess(res, 'Success', assessmentResponse);
		} catch (ex) {
			next(ex);
		}
	};
}

export default AssessmentController;
