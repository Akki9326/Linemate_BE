import { DataTypes, Sequelize } from 'sequelize';
import { TemplateStatus, TemplateType } from '../enums/template.enum';
import { AppDBModel, AppDB_Common_Fields } from './app-db.model';
import { UserModel } from './users.model';
import { Channel } from '../enums/campaign.enums';

export class TemplateModel extends AppDBModel {
	public id: number;
	public name: string;
	public description: string;
	public channel: string;
	public templateType: string;
	public language: string;
	public tenantId: number;
	public thumbnailUrl: string;
	public mediaDuration: string;
	public providerTemplateId: string;
	public notificationTemplateId: string;
	public status: string;
	public isArchive: boolean;
}

export default function (sequelize: Sequelize): typeof TemplateModel {
	TemplateModel.init(
		{
			...AppDB_Common_Fields,
			id: {
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.INTEGER,
			},
			name: {
				allowNull: true,
				type: DataTypes.STRING,
			},
			description: {
				allowNull: true,
				type: DataTypes.STRING,
			},
			status: {
				allowNull: true,
				type: DataTypes.ENUM,
				defaultValue: TemplateStatus.DRAFT,
				values: Object.values(TemplateStatus),
			},
			channel: {
				allowNull: false,
				type: DataTypes.ENUM,
				values: Object.values(Channel),
			},
			templateType: {
				allowNull: true,
				type: DataTypes.ENUM,
				values: Object.values(TemplateType),
			},
			language: {
				allowNull: false,
				type: DataTypes.STRING,
			},
			tenantId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			providerTemplateId: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			notificationTemplateId: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			isArchive: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
		},
		{
			tableName: 'template',
			sequelize,
		},
	);
	TemplateModel.belongsTo(UserModel, {
		foreignKey: 'createdBy',
		as: 'Creator',
	});

	TemplateModel.belongsTo(UserModel, {
		foreignKey: 'updatedBy',
		as: 'Updater',
	});

	return TemplateModel;
}
