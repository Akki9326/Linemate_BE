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
	Template = 'template',
}
export enum FilterKey {
	JoiningDate = 'joiningDate',
	CustomFields = 'customFields',
	Experience = 'experience',
	Cohort = 'cohort',
	CreatedDate = 'createdDate',
	UpdateDate = 'updateDate',
	Language = 'language',
	Channel = 'channel',
	TemplateStatus = 'templateStatus',
	CreatedBy = 'createdBy',
}
export const commonFilterConfig = [
	{
		filterFor: FilterFor.Employee,
		filterFields: [
			{
				filterTitle: 'Joining Date',
				filterKey: FilterKey.JoiningDate,
				filterType: FiltersEnum.DateRange,
			},
			{
				filterTitle: 'Custom Fields',
				filterKey: FilterKey.CustomFields,
				filterType: FiltersEnum.DropDown,
			},
			{
				filterTitle: 'Experience',
				filterKey: FilterKey.Experience,
				filterType: FiltersEnum.NumberRange,
			},
			{
				filterTitle: 'Cohort',
				filterKey: FilterKey.Cohort,
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
		filterFields: [
			{
				filterTitle: 'Created Date',
				filterKey: FilterKey.CreatedDate,
				filterType: FiltersEnum.DateRange,
			},
			{
				filterTitle: 'Updated Date',
				filterKey: FilterKey.UpdateDate,
				filterType: FiltersEnum.DateRange,
			},
		],
	},
	{
		filterFor: FilterFor.Cohort,
		filterFields: [
			{
				filterTitle: 'Joining Date',
				filterKey: FilterKey.JoiningDate,
				filterType: FiltersEnum.DateRange,
			},
			{
				filterTitle: 'Custom Fields',
				filterKey: FilterKey.CustomFields,
				filterType: FiltersEnum.DropDown,
			},
			{
				filterTitle: 'Cohort',
				filterKey: FilterKey.Cohort,
				filterType: FiltersEnum.DropDown,
			},
		],
	},
	{
		filterFor: FilterFor.Template,
		filterFields: [
			{
				filterTitle: 'Created Date',
				filterKey: FilterKey.CreatedDate,
				filterType: FiltersEnum.DateRange,
			},
			{
				filterTitle: 'Language',
				filterKey: FilterKey.Language,
				filterType: FiltersEnum.DropDown,
			},
			{
				filterTitle: 'Channel',
				filterKey: FilterKey.Channel,
				filterType: FiltersEnum.DropDown,
			},
			{
				filterTitle: 'Status',
				filterKey: FilterKey.TemplateStatus,
				filterType: FiltersEnum.DropDown,
			},
			{
				filterTitle: 'CreatedBy',
				filterKey: FilterKey.CreatedBy,
				filterType: FiltersEnum.DropDown,
			},
		],
	},
];
