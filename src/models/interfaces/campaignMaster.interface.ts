import { CampaignStatusType } from '../enums/campaign.enums';
export interface CampaignMaster {
	id: number;
	name: string;
	description?: string;
	channel: string[];
	whatsappTemplateId: number;
	smsTemplateId: number;
	viberTemplateId: number;
	rules: object[];
	tags?: string[];
	status: CampaignStatusType;
	isArchived?: boolean;
	tenantId:number
}

export interface CampaignCondition {
	title: string;
	operators: 'EQUAL' | 'LESS_THAN' | 'GREATER_THAN' | 'BETWEEN';
	value: string | number | boolean | Date;
	variableId?: number;
}

export interface LogicalOperator {
	and?: (CampaignCondition | LogicalOperator)[];
	or?: (CampaignCondition | LogicalOperator)[];
}

export interface CampaignRuleQuery extends LogicalOperator {}

export interface BetweenDateValue {
	startDate: string;
	endDate: string;
}
