export interface CampaignRecurrence {
	repeatEvery: number;
	intervalTimeUnit: 'Days' | 'Weeks' | 'Months';
	startDate: Date;
	endDate?: Date;
	afterOccurences?: number;
	time?: string;
}
