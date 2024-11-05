import DB from '@/databases';
import { IntervalUnitType, TriggerType } from '@/models/enums/campaign.enums';
import { CampaignService } from './campaign.service';
import { format, startOfDay } from 'date-fns';

interface ReoccurenceDetails {
	repeatEvery: number;
	intervalTimeUnit: string;
	afterOccurences: number;
	startDate: Date;
	endDate: Date;
	time: string;
}

export class CampaignCronService {
	private campaignMaster = DB.CampaignMaster;
	private campaignService = new CampaignService();

	async triggerCampaign() {
		function getDifferenceInDays(date1: string, date2: string): number {
			// Parse the date strings into Date objects
			const d1 = new Date(date1);
			const d2 = new Date(date2);

			// Get the time difference in milliseconds
			const timeDifference = d1.getTime() - d2.getTime();

			// Convert the time difference from milliseconds to days
			const differenceInDays = timeDifference / (1000 * 60 * 60 * 24);

			// Return the absolute value of the difference (so it’s always positive)
			return Math.abs(Math.floor(differenceInDays));
		}

		function getDifferenceInWeeks(date1: string, date2: string): number {
			// Parse the date strings into Date objects
			const d1 = new Date(date1);
			const d2 = new Date(date2);

			// Get the time difference in milliseconds
			const timeDifference = d1.getTime() - d2.getTime();

			// Convert the time difference from milliseconds to weeks
			const differenceInWeeks = timeDifference / (1000 * 60 * 60 * 24 * 7);

			// Return the absolute value of the full weeks
			return Math.abs(Math.floor(differenceInWeeks));
		}

		function getDifferenceInMonths(date1: string, date2: string): number {
			// Parse the date strings into Date objects
			const d1 = new Date(date1);
			const d2 = new Date(date2);

			// Calculate the year and month difference
			const yearDifference = d1.getFullYear() - d2.getFullYear();
			const monthDifference = d1.getMonth() - d2.getMonth();

			// Total difference in months
			const totalMonths = yearDifference * 12 + monthDifference;

			// Return the absolute value of the full months
			return Math.abs(totalMonths);
		}

		const campaignList = await this.campaignMaster.findAll({
			where: {
				isDeleted: false,
				id: 64,
			},
		});

		for (const campaign of campaignList) {
			// Check if reoccurenceDetails exist and cast it to the correct type
			const reoccurenceDetails = campaign.reoccurenceDetails as ReoccurenceDetails;

			if (reoccurenceDetails && startOfDay(new Date(reoccurenceDetails.startDate)) >= new Date()) {
				continue;
			}

			if (reoccurenceDetails && new Date(reoccurenceDetails.endDate) <= new Date()) {
				continue;
			}

			const firstFormatedDate = format(new Date(reoccurenceDetails.startDate), 'yyyy-MM-dd');
			const SecondFormatedDate = format(new Date(), 'yyyy-MM-dd');

			if (firstFormatedDate == SecondFormatedDate) {
				await this.campaignService.automaticFiredCampaign(campaign.id);
			}

			if (reoccurenceDetails.intervalTimeUnit == IntervalUnitType.day) {
				const lastTrigerInfo = await DB.CampaignTriggerMatrix.findAll({
					where: {
						campaignId: campaign.id,
						fireType: TriggerType.automatic,
						isFired: true,
					},
					order: [['id', 'DESC']],
				});
				if (lastTrigerInfo.length == reoccurenceDetails.afterOccurences) {
					continue;
				}
				const lastTriger = lastTrigerInfo[0];
				const lastTrigerDate = String(lastTriger.firedOn);
				const dayDifference = getDifferenceInDays(lastTrigerDate, String(new Date()));
				if (dayDifference == reoccurenceDetails.repeatEvery) {
					await this.campaignService.automaticFiredCampaign(campaign.id);
				}
			}

			if (reoccurenceDetails.intervalTimeUnit == IntervalUnitType.week) {
				const lastTrigerInfo = await DB.CampaignTriggerMatrix.findAll({
					where: {
						campaignId: campaign.id,
						fireType: TriggerType.automatic,
						isFired: true,
					},
					order: [['id', 'DESC']],
				});
				if (lastTrigerInfo.length == reoccurenceDetails.afterOccurences) {
					continue;
				}
				const lastTriger = lastTrigerInfo[0];
				const lastTrigerDate = String(lastTriger.firedOn);
				const dayDifference = getDifferenceInWeeks(lastTrigerDate, String(new Date()));
				if (dayDifference == reoccurenceDetails.repeatEvery) {
					await this.campaignService.automaticFiredCampaign(campaign.id);
				}
			}

			if (reoccurenceDetails.intervalTimeUnit == IntervalUnitType.month) {
				const lastTrigerInfo = await DB.CampaignTriggerMatrix.findAll({
					where: {
						campaignId: campaign.id,
						fireType: TriggerType.automatic,
					},
					order: [['id', 'DESC']],
				});
				if (lastTrigerInfo.length == reoccurenceDetails.afterOccurences) {
					continue;
				}
				const lastTriger = lastTrigerInfo[0];
				const lastTrigerDate = String(lastTriger.firedOn);
				const dayDifference = getDifferenceInMonths(lastTrigerDate, String(new Date()));
				if (dayDifference == reoccurenceDetails.repeatEvery) {
					await this.campaignService.automaticFiredCampaign(campaign.id);
				}
			}
		}
	}
}
