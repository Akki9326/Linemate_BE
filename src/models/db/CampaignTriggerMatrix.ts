import { Sequelize, DataTypes } from 'sequelize';
import { AppDBModel } from './app-db.model';
import { TriggerType } from '../enums/campaign.enums';

export class campaignTriggerMatrix extends AppDBModel {
	public id: number;
	public fireType: TriggerType;
	public campaignId: number;
	public fynoCampaignId: string;
	public firedOn: Date;
	public scheduleDate: Date;
	public isFired: boolean;
}

export default function (sequelize: Sequelize): typeof campaignTriggerMatrix {
	campaignTriggerMatrix.init(
		{
			id: {
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.INTEGER,
			},
			fireType: {
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
			fynoCampaignId: {
				type: DataTypes.STRING,
			},
			isFired: {
				type: DataTypes.BOOLEAN,
			},
			firedOn: {
				type: DataTypes.DATE,
				defaultValue: false,
			},
			scheduleDate: {
				type: DataTypes.DATE,
			},
			createdAt: {
				allowNull: false,
				type: DataTypes.DATE,
				defaultValue: Sequelize.literal('now()'),
			},
			updatedAt: {
				allowNull: true,
				type: DataTypes.DATE,
				defaultValue: Sequelize.literal('now()'),
			},
			createdBy: {
				allowNull: false,
				type: DataTypes.INTEGER,
				defaultValue: 0,
			},
			updatedBy: {
				allowNull: true,
				type: DataTypes.INTEGER,
			},
		},
		{
			tableName: 'campaignTriggerMatrix',
			sequelize,
		},
	);
	return campaignTriggerMatrix;
}
