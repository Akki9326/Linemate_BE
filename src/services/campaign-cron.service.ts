import DB from '@/databases';
import { IntervalUnitType, TriggerType } from '@/models/enums/campaign.enums';
import { CampaignService } from './campaign.service';
import { differenceInDays, differenceInMonths, differenceInWeeks, format, startOfDay } from 'date-fns';

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
				continue;
			}

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

			if (lastTrigerInfo.length) {

				const lastTriger = lastTrigerInfo[0];

				const lastTrigerDate = new Date(lastTriger.firedOn);
				let difference = 0;
				if (reoccurenceDetails.intervalTimeUnit == IntervalUnitType.day) {
					difference = differenceInDays(lastTrigerDate, new Date());
				}

				else if (reoccurenceDetails.intervalTimeUnit == IntervalUnitType.week) {
					difference = differenceInWeeks(lastTrigerDate, new Date());
				}

				else if (reoccurenceDetails.intervalTimeUnit == IntervalUnitType.month) {
					difference = differenceInMonths(lastTrigerDate, new Date());
				}

				if (difference == reoccurenceDetails.repeatEvery) {
					await this.campaignService.automaticFiredCampaign(campaign.id);
				}
			}
		}
	}
}
