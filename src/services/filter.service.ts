import { commonFilterConfig, FilterFor, FiltersEnum } from '@/models/enums/filter.enum';
import moment from 'moment';
import VariableServices from './variable.service';
import { AppMessages, FilterMessage } from '@/utils/helpers/app-message.helper';
import { FilterResponse } from '@/models/interfaces/filter.interface';
import { BadRequestException } from '@/exceptions/BadRequestException';

export class FilterService {
	private variableServices = new VariableServices();

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

	private async generateFilterResponse(tenantId: number, filterFor: string): Promise<FilterResponse[]> {
		const filterResponse: FilterResponse[] = [];
		const startOfMonth = moment().startOf('month').format('YYYY-MM-DD');
		const endOfMonth = moment().endOf('month').format('YYYY-MM-DD');

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
				const customFields = await this.getCustomFields(tenantId);
				filterResponse.push(...customFields);
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
