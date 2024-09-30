import { Sequelize, DataTypes } from 'sequelize';
import { AppDB_Common_Fields, AppDBModel } from './app-db.model';
import { TriggerType, IntervalUnitType } from '../enums/campaign.enums';

export class CampaignMatrixModel extends AppDBModel {
	public id: number;
	public triggerType: TriggerType;
	public campaignId: number;
	public intervalUnit: IntervalUnitType;
	public startDate: Date;
	public endDate: Date;
	public neverEnds: boolean;
	public endsAfterOccurences: number;
	public triggered: number;
	public delivered: number;
	public read: number;
	public clicked: number;
	public failed: number;
}

export default function (sequelize: Sequelize): typeof CampaignMatrixModel {
	CampaignMatrixModel.init(
		{
			...AppDB_Common_Fields,
			id: {
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.INTEGER,
			},
			triggerType: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			campaignId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: 'campaignMaster',
					key: 'id',
				},
			},
			triggered: {
				type: DataTypes.INTEGER,
			},
			delivered: {
				type: DataTypes.INTEGER,
			},
			read: {
				type: DataTypes.INTEGER,
			},
			clidked: {
				type: DataTypes.INTEGER,
			},
			failed: {
				type: DataTypes.INTEGER,
			},
		},
		{
			tableName: 'campaignMatrix',
			sequelize,
		},
	);
	return CampaignMatrixModel;
}
