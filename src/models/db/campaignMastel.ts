import { DataTypes, Sequelize } from 'sequelize';
import { AppDB_Common_Fields, AppDBModel } from './app-db.model';
import { CampaignStatusType, ChannelType } from '../enums/campaign.enums';

export class CampaignMasterModel extends AppDBModel {
	public id: number;
	public name: string;
	public description: string;
	public channel: ChannelType;
	public whatsappTemplateId: number;
	public smsTemplateId: number;
	public viberTemplateId: number;
	public rules: object[];
	public tags: string[];
	public status: CampaignStatusType;
	public isArchived: boolean;
}

export default function (sequelize: Sequelize) {
	CampaignMasterModel.init(
		{
			...AppDB_Common_Fields,
			id: {
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.INTEGER,
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			description: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			channel: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			whatsappTemplateId: {
				type: DataTypes.STRING,
			},
			smsTemplateId: {
				type: DataTypes.STRING,
			},
			viberTemplateId: {
				type: DataTypes.STRING,
			},
			rules: {
				type: DataTypes.JSONB,
				allowNull: false,
			},
			tags: {
				type: DataTypes.ARRAY(DataTypes.STRING),
			},
			status: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			isArchived: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
		},
		{
			tableName: 'campaignMaster',
			sequelize,
		},
	);
	return CampaignMasterModel;
}
