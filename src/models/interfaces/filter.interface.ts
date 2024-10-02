import { Op } from 'sequelize';
import { FiltersEnum } from '../enums/filter.enum';

export interface FilterResponse {
	filterTitle: string;
	filterKey: string;
	filterType: FiltersEnum;
	maxValue?: string | number;
	minValue?: string | number;
	selectedValue?: string;
	variableId?: number;
	options?: object[];
}

export interface FilterCondition {
	id?:
		| {
				[Op.in]?: number[];
		  }
		| string;
}
