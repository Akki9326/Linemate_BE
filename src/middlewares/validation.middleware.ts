import { BadRequestException } from '@/exceptions/BadRequestException';
import { AppMessages } from '@/utils/helpers/app-message.helper';
import { ErrorExtractor } from '@/utils/helpers/error-extractor';
import { plainToInstance } from 'class-transformer';
import { ValidationError, validate } from 'class-validator';
import { RequestHandler } from 'express';

const errorExtractor = new ErrorExtractor();

const validationMiddleware = (
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	type: any,
	value: string | 'body' | 'query' | 'params' = 'body',
	skipMissingProperties = false,
	whitelist = true,
	forbidNonWhitelisted = true,
): RequestHandler => {
	return (req, res, next) => {
		const validationMessage = `${AppMessages.invalidPayload}` + `${value}`;
		validate(plainToInstance(type, req[value]), { skipMissingProperties, whitelist, forbidNonWhitelisted }).then((errors: ValidationError[]) => {
			if (errors.length > 0) {
				const errorMessages = errorExtractor.extractDeepestErrors(errors);
				next(new BadRequestException(validationMessage, errorMessages));
			} else {
				next();
			}
		});
	};
};

export default validationMiddleware;
