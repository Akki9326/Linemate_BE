export interface variableValues {
	variableId: number;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	value: any;
}
export interface TenantVariables {
	tenantId?: number;
	variables: variableValues[];
}
