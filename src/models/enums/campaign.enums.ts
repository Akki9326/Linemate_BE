export enum CampaignStatusType {
	completed = 'completed',
	inProgress = 'in-progress',
	failed = 'failed',
}
export enum TriggerType {
	manual = 'Manual',
	automatic = 'Automatic',
}
export enum IntervalUnitType {
	day = 'day',
	week = 'week',
	month = 'month',
}
export enum RuleOperators {
	EQUAL = 'EQUAL',
	LESS_THAN = 'LESS_THAN',
	GREATER_THAN = 'GREATER_THAN',
	BETWEEN = 'BETWEEN',
}
export enum CampaignRuleDataTypes {
	DropDown = 'dropDown',
	DateRange = 'DateRange',
	Cohorts = 'Cohort/Groups',
}
export enum ReoccurenceType {
	custom = 'custom',
	once = 'once',
}
export enum Channel {
	whatsapp = 'whatsapp',
	sms = 'sms',
	viber = 'viber',
}
