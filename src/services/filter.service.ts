import { BadRequestException } from '@/exceptions/BadRequestException';
import { commonFilterConfig, FilterFor, FiltersEnum } from '@/models/enums/filter.enum';
import { FilterResponse } from '@/models/interfaces/filter.interface';
import { AppMessages, FilterMessage } from '@/utils/helpers/app-message.helper';
import moment from 'moment';
import { CohortService } from './cohort.service';
import VariableServices from './variable.service';

export class FilterService {
	private variableServices = new VariableServices();
	private cohortService = new CohortService();

	constructor() {}

	private async getCustomFields(tenantId: number): Promise<FilterResponse[]> {
		try {
			const customVariables = await this.variableServices.getVariableByTenantId(tenantId);
			return customVariables.map(variable => ({
				filterTitle: variable.name,
				filterKey: variable.name,
				filterType: FiltersEnum.DropDown,
				selectedValue: '',
				variableId: variable.id,
				options: variable.options || [],
			}));
		} catch (error) {
			return [];
		}
	}
	private async getCohorts(tenantId: number) {
		try {
			const customVariables = await this.cohortService.cohortByTenantId(tenantId);
			return customVariables.map(cohort => ({
				id: cohort.id,
				name: cohort.name,
			}));
		} catch (error) {
			return [];
		}
	}

	private async generateFilterResponse(tenantId: number, filterFor: string): Promise<FilterResponse[]> {
		const filterResponse: FilterResponse[] = [];
		const startOfMonth = moment().startOf('month').toISOString();
		const endOfMonth = moment().endOf('month').toISOString();
		const filterConfig = commonFilterConfig.find(config => config.filterFor === filterFor);
		if (!filterConfig) {
			throw new BadRequestException(`Invalid filterFor value: ${filterFor}`);
		}

		for (const field of filterConfig.filterFields) {
			if (field.filterType === FiltersEnum.DateRange) {
				filterResponse.push({
					filterTitle: field.filterTitle,
					filterKey: field.filterKey,
					filterType: field.filterType,
					minValue: startOfMonth,
					maxValue: endOfMonth,
				});
			} else if (field.filterType === FiltersEnum.DropDown) {
				if (field.filterKey === 'customFields') {
					const customFields = await this.getCustomFields(tenantId);
					filterResponse.push(...customFields);
				}
				if (field.filterKey === 'cohort') {
					const cohorts = await this.getCohorts(tenantId);
					filterResponse.push({
						filterTitle: field.filterTitle,
						filterKey: field.filterKey,
						filterType: field.filterType,
						selectedValue: '',
						options: cohorts,
					});
				}
			} else if (field.filterType === FiltersEnum.NumberRange) {
				filterResponse.push({
					filterTitle: field.filterTitle,
					filterKey: field.filterKey,
					filterType: field.filterType,
					maxValue: 2,
					minValue: 1,
				});
			}
		}

		return filterResponse;
	}

	public async list(tenantId: number, filterFor: FilterFor) {
		if (!filterFor) {
			throw new BadRequestException(FilterMessage.filterForNotFound);
		}
		if (!tenantId) {
			throw new BadRequestException(AppMessages.headerTenantId);
		}
		return await this.generateFilterResponse(tenantId, filterFor);
	}
}
