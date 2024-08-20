import DB from '@/databases';
import { CohortRuleDataTypes, RuleOperators, RuleTypes } from '@/models/enums/cohort.enum';
import VariableServices from './variable.service';

export class CohortService {
	private cohort = DB.CohortMaster;
	private variableServices = new VariableServices();

	constructor() {}

	public async getCustomFields(tenantId: number) {
		try {
			const customVariables = await this.variableServices.getVariableByTenantId(tenantId);
			return customVariables.map(variable => ({
				title: variable.name,
				type: CohortRuleDataTypes.DropDown,
				options: variable.options || [],
				operators: [RuleOperators.EQUAL],
			}));
		} catch (error) {
			return [];
		}
	}

	public async ruleOptions(tenantId: number) {
		// const cohortsList = await this.cohort.findAll({
		// 	where: { tenantId: tenantId, isDeleted: false },
		// 	attributes: ['id', 'name'],
		// });
		const customVariable = await this.getCustomFields(tenantId);
		const response = [
			{
				title: RuleTypes.Cohort,
				type: CohortRuleDataTypes.DropDown,
				options: [],
				operators: [RuleOperators.EQUAL],
			},
			{
				title: RuleTypes.JoiningDate,
				type: CohortRuleDataTypes.Date,
				operators: [RuleOperators.LESS_THAN, RuleOperators.GREATER_THAN, RuleOperators.BETWEEN],
			},
			...customVariable,
		];
		return response;
	}
}
