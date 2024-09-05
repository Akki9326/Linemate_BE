import { FiltersEnum } from '../enums/filter.enum';

export interface FilterResponse {
	filterTitle: string;
	filterKey: string;
	filterType: FiltersEnum;
	maxValue?: string | number;
	minValue?: string | number;
	selectedValue?: string;
	variableId?: number;
	options?: string[] | object[];
}
