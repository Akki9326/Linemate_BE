export interface ListRequestModel {
	page: number;
	limit: number;
	sortBy: string;
	sortDirection: 'ASC' | 'DESC';
	filter: any;
	search: string;
}
