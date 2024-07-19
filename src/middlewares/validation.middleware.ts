import { BadRequestException } from '@/exceptions/BadRequestException';
import { plainToInstance } from 'class-transformer';
import { ValidationError, validate } from 'class-validator';
import { RequestHandler } from 'express';

// Utility function to recursively extract error messages
const extractValidationErrors = (errors: ValidationError[]): string[] => {
	const result: string[] = [];

	errors.forEach((error: ValidationError) => {
		if (error.children && error.children.length > 0) {
			result.push(...extractValidationErrors(error.children));
		}

		// Add constraints messages
		if (error.constraints) {
			result.push(...Object.values(error.constraints));
		}
	});

	return result;
};

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
				const errorMessages = extractValidationErrors(errors).join(', ');
				next(new BadRequestException(errorMessages));
			} else {
				next();
			}
		});
	};
};

export default validationMiddleware;
