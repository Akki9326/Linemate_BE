import { DataTypes, Sequelize } from 'sequelize';
import { AppDB_Common_Fields, AppDBModel } from './app-db.model';
import { CampaignStatusType } from '../enums/campaign.enums';

export class CampaignMasterModel extends AppDBModel {
	public id: number;
	public name: string;
	public description: string;
	public channel: string[];
	public whatsappTemplateId: number;
	public smsTemplateId: number;
	public viberTemplateId: number;
	public rules: object[];
	public tags: string[];
	public status: CampaignStatusType;
	public isArchived: boolean;
	public tenantId: number;
	public reoccurenceType: string;
	public reoccurenceDetails: object;
}

export default function (sequelize: Sequelize): typeof CampaignMasterModel {
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
				allowNull: true,
			},
			channel: {
				type: DataTypes.ARRAY(DataTypes.TEXT),
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
				type: DataTypes.ARRAY(DataTypes.TEXT),
				allowNull: true,
				defaultValue: [],
			},
			status: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			isArchived: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			tenantId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			reoccurenceType: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			reoccurenceDetails: {
				type: DataTypes.JSONB,
				allowNull: true,
			},
		},
		{
			tableName: 'campaignMaster',
			sequelize,
		},
	);
	return CampaignMasterModel;
}
