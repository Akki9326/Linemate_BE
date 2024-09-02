import DB from '@/databases';
import { BadRequestException } from '@/exceptions/BadRequestException';
import { CohortRuleQuery } from '@/models/interfaces/cohort.interface';
import { endOfDay, isValid, parseISO, startOfDay } from 'date-fns';
import { Op } from 'sequelize';
/* eslint-disable @typescript-eslint/no-explicit-any */

const queryCohort = async (cohortValue: number, operator: string) => {
	let query = {};
	switch (operator) {
		case 'EQUAL':
			query = { cohortId: cohortValue, isDeleted: false };
			break;
		case 'NOTEQUAL':
			query = { cohortId: { [Op.ne]: cohortValue }, isDeleted: false };
			break;
		default:
			throw new BadRequestException(`Unsupported operator for cohort: ${operator}`);
	}
	const data = await DB.CohortMatrix.findAll({
		where: query,
		attributes: ['userId'],
	});

	const userIds = data.map(item => item.userId);
	return userIds;
};

async function queryVariableMatrix(variableId: number, variableValue: string, operator: string) {
	let query = {};
	switch (operator) {
		case 'EQUAL':
			query = { variableId: variableId, value: variableValue, isDeleted: false };
			break;
		case 'NOTEQUAL':
			query = { variableId: variableId, value: { [Op.ne]: variableValue }, isDeleted: false };
			break;
		default:
			throw new BadRequestException(`Unsupported operator for role: ${operator}`);
	}
	const data = await DB.VariableMatrix.findAll({
		where: query,
		attributes: ['userId'],
	});
	const userIds = data.map(item => item.userId);
	return userIds;
}

async function queryUserByDate(dateValue: any, operator: string) {
	let query = {};

	const parseDate = (dateStr: string) => {
		const parsedDate = parseISO(dateStr);
		if (!isValid(parsedDate)) {
			throw new BadRequestException(`Invalid date format: ${dateStr}`);
		}
		return parsedDate;
	};

	switch (operator) {
		case 'LESS_THAN':
			query = { createdAt: { [Op.lt]: parseDate(dateValue) } };
			break;
		case 'GREATER_THAN':
			query = { createdAt: { [Op.gt]: parseDate(dateValue) } };
			break;
		case 'EQUAL':
			query = {
				createdAt: {
					[Op.between]: [startOfDay(parseDate(dateValue)), endOfDay(parseDate(dateValue))],
				},
			};
			break;
		case 'NOTEQUAL':
			query = { createdAt: { [Op.notBetween]: [startOfDay(parseDate(dateValue)), endOfDay(parseDate(dateValue))] } };
			break;
		case 'BETWEEN':
			if (!dateValue.startDate || !dateValue.endDate) {
				throw new BadRequestException('Both startDate and endDate must be provided for BETWEEN operator');
			}
			query = {
				createdAt: {
					[Op.between]: [parseDate(dateValue.startDate), parseDate(dateValue.endDate)],
				},
			};
			break;
		default:
			throw new BadRequestException(`Unsupported operator for createdAt: ${operator}`);
	}

	const data = await DB.Users.findAll({
		where: query,
		attributes: ['id'],
	});
	const userIds = data.map(item => item.id);
	return userIds;
}

export const applyingCohort = async (cohortRule: CohortRuleQuery[]) => {
	const userSets = [];

	async function processAndCondition(condition: any) {
		let results: number[] = [];
		if (condition.and) {
			for (const subCondition of condition.and) {
				// Check if subCondition has an 'or' clause or is a direct condition
				let subResults;
				if (subCondition.or) {
					subResults = await processOrCondition(subCondition);
				} else if (subCondition.and) {
					subResults = await processAndCondition(subCondition);
				} else {
					subResults = await processCondition(subCondition);
				}

				if (results.length === 0) {
					results = subResults;
				} else {
					results = results.filter(id => subResults.includes(id));
				}
			}
		}
		return results;
	}

	async function processOrCondition(condition: any) {
		const results = new Set<number>();
		for (const subCondition of condition.or) {
			let userIds;
			if (subCondition.or) {
				userIds = await processOrCondition(subCondition);
			} else if (subCondition.and) {
				userIds = await processAndCondition(subCondition);
			} else {
				userIds = await processAndCondition(subCondition);
			}
			userIds.forEach(id => results.add(id));
		}
		return Array.from(results);
	}

	async function processCondition(condition: any) {
		const { title, operators, value, variableId } = condition;

		if (!title || !operators || value === undefined) {
			throw new BadRequestException(`Invalid condition: ${JSON.stringify(condition)}`);
		}

		if (title === 'cohort') {
			return await queryCohort(value, operators);
		} else if (variableId) {
			return await queryVariableMatrix(variableId, value, operators);
		} else if (title === 'joiningDate') {
			return await queryUserByDate(value, operators);
		} else {
			throw new BadRequestException(`Unsupported title: ${title}`);
		}
	}

	// Iterate over each rule in cohortRule
	for (const rule of cohortRule) {
		if (rule.and) {
			userSets.push(await processAndCondition(rule));
		} else if (rule.or) {
			userSets.push(await processOrCondition(rule));
		} else {
			throw new BadRequestException(`Invalid rule: ${JSON.stringify(rule)}`);
		}
	}

	// Return the first set of results, or an empty array if no results
	console.log('userSets', userSets[0]);
	return userSets.length > 0 ? userSets[0] : [];
};
