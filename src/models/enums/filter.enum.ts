export enum FiltersEnum {
	DropDown = 'DropDown',
	DateRange = 'DateRange',
	NumberRange = 'NumberRange',
}
export enum FilterFor {
	Employee = 'employee',
	Tenant = 'tenant',
	Content = 'content',
	Cohort = 'cohort',
}
export const commonFilterConfig = [
	{
		filterFor: FilterFor.Employee,
		filterFields: [
			{
				filterTitle: 'Joining Date',
				filterKey: 'joiningDate',
				filterType: FiltersEnum.DateRange,
			},
			{
				filterTitle: 'Custom Fields',
				filterKey: 'customFields',
				filterType: FiltersEnum.DropDown,
			},
			{
				filterTitle: 'Experience',
				filterKey: 'experience',
				filterType: FiltersEnum.NumberRange,
			},
			{
				filterTitle: 'Cohort',
				filterKey: 'cohort',
				filterType: FiltersEnum.DropDown,
			},
		],
	},
	{
		filterFor: FilterFor.Tenant,
		filterFields: [],
	},
	{
		filterFor: FilterFor.Content,
		filterFields: [],
	},
	{
		filterFor: FilterFor.Cohort,
		filterFields: [
			{
				filterTitle: 'Joining Date',
				filterKey: 'joiningDate',
				filterType: FiltersEnum.DateRange,
			},
			{
				filterTitle: 'Custom Fields',
				filterKey: 'customFields',
				filterType: FiltersEnum.DropDown,
			},
			{
				filterTitle: 'Cohort',
				filterKey: 'cohort',
				filterType: FiltersEnum.DropDown,
			},
		],
	},
];
