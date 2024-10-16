import { BadRequestException } from '@/exceptions/BadRequestException';
import { commonFilterConfig, FilterFor, FilterKey, FiltersEnum } from '@/models/enums/filter.enum';
import { Channel, TemplateStatus } from '@/models/enums/template.enum';
import { FilterResponse } from '@/models/interfaces/filter.interface';
import { AppMessages, FilterMessage } from '@/utils/helpers/app-message.helper';
import { FilterHelper } from '@/utils/helpers/filter.helper';
import moment from 'moment';
import { CohortService } from './cohort.service';
import { LanguageService } from './language.service';
import VariableServices from './variable.service';
import { ContentStatus, ConteTypes } from '@/models/enums/contentType.enum';

export class FilterService {
	private variableServices = new VariableServices();
	private cohortService = new CohortService();
	private languageService = new LanguageService();

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
				options: variable.options?.length ? FilterHelper.formatOptions(variable.options) : [],
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
				if (field.filterKey === FilterKey.CustomFields) {
					const customFields = await this.getCustomFields(tenantId);
					filterResponse.push(...customFields);
				}
				if (field.filterKey === FilterKey.Cohort) {
					const cohorts = await this.getCohorts(tenantId);
					filterResponse.push({
						filterTitle: field.filterTitle,
						filterKey: field.filterKey,
						filterType: field.filterType,
						selectedValue: '',
						options: cohorts,
					});
				}
				if (field.filterKey === FilterKey.Channel) {
					filterResponse.push({
						filterTitle: field.filterTitle,
						filterKey: field.filterKey,
						filterType: field.filterType,
						selectedValue: '',
						options: Object.values(Channel)?.length ? FilterHelper.formatOptions(Object.values(Channel)) : [],
					});
				}
				if (field.filterKey === FilterKey.TemplateStatus) {
					filterResponse.push({
						filterTitle: field.filterTitle,
						filterKey: field.filterKey,
						filterType: field.filterType,
						selectedValue: '',
						options: Object.values(TemplateStatus)?.length ? FilterHelper.formatOptions(Object.values(TemplateStatus)) : [],
					});
				}
				if (field.filterKey === FilterKey.Language) {
					const languages = await this.languageService.list();
					filterResponse.push({
						filterTitle: field.filterTitle,
						filterKey: field.filterKey,
						filterType: field.filterType,
						selectedValue: '',
						options: FilterHelper.formatOptions(languages.map(language => language.code)),
					});
				}
				if (field.filterKey === FilterKey.CreatedBy) {
					filterResponse.push({
						filterTitle: field.filterTitle,
						filterKey: field.filterKey,
						filterType: field.filterType,
						selectedValue: '',
						options: await FilterHelper.createdByOption(tenantId),
					});
				}
				if (field.filterKey === FilterKey.MediaType) {
					filterResponse.push({
						filterTitle: field.filterTitle,
						filterKey: field.filterKey,
						filterType: field.filterType,
						selectedValue: '',
						options: Object.values(ConteTypes)?.length ? FilterHelper.formatOptions(Object.values(ConteTypes)) : [],
					});
				}
				if (field.filterKey === FilterKey.MediaType) {
					filterResponse.push({
						filterTitle: field.filterTitle,
						filterKey: field.filterKey,
						filterType: field.filterType,
						selectedValue: '',
						options: Object.values(ContentStatus)?.length ? FilterHelper.formatOptions(Object.values(ContentStatus)) : [],
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
