export interface userValues {
	firstName: string;
	lastName: string;
	email: string;
	userType: string;
	mobileNumber: string;
	countyCode: string;
}
export interface importUser {
	data: userValues[];
}
