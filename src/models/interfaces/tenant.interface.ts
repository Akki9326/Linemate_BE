export interface createdBy {
	firstName: string;
	lastName: string;
}
export interface Tenant {
	id: number;
	name: string;
	trademark: string;
	createdBy: createdBy;
	phoneNumber: string;
}
