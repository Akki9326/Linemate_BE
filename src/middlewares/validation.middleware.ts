import { BadRequestException } from '@/exceptions/BadRequestException';
import { plainToInstance } from 'class-transformer';
import { ValidationError, validate } from 'class-validator';
import { RequestHandler } from 'express';

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
				const message = errors.map((error: ValidationError) => Object.values(error.constraints)).join(', ');
				next(new BadRequestException(message));
			} else {
				next();
			}
		});
	};
};

export default validationMiddleware;
