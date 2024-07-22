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
		validate(plainToInstance(type, req[value]), { skipMissingProperties, whitelist, forbidNonWhitelisted }).then((errors: ValidationError[]) => {
			if (errors.length > 0) {
				let message;
				errors.map((error: ValidationError) => {
					if (error.constraints) {
						message = Object.values(error.constraints).join(', ');
					}
				});
				if (message) {
					next(new BadRequestException(message));
				} else {
					message = `${AppMessages.invalidPayload}` + `${value}`;
					const errorStack = errorExtractor.extractDeepestErrors(errors);
					next(new BadRequestException(message, errorStack));
				}
			} else {
				next();
			}
		});
	};
};

export default validationMiddleware;
