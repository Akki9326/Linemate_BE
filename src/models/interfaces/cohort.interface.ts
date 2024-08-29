export interface Condition {
	title: string;
	operators: 'EQUAL' | 'LESS_THAN' | 'GREATER_THAN' | 'NOTEQUAL'; // NOTEQUAL should match your existing operator
	value: string | number | boolean | Date;
	variableId?: number;
}

export interface LogicalOperator {
	and?: (Condition | LogicalOperator)[];
	or?: (Condition | LogicalOperator)[];
}

export interface CohortRuleQuery extends LogicalOperator {}

export interface SingleDateValue {
	date: string;
}

export interface BetweenDateValue {
	startDate: string;
	endDate: string;
}

export type DateValue = SingleDateValue | BetweenDateValue;
