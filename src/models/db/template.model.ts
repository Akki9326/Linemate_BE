import { DataTypes, Sequelize } from 'sequelize';
import { Channel, TemplateStatus, TemplateType } from '../enums/template.enum';
import { AppDBModel, AppDB_Common_Fields } from './app-db.model';

export class TemplateModel extends AppDBModel {
	public id: number;
	public name: string;
	public description: string;
	public channel: string;
	public templateType: string;
	public clientTemplateId: string;
	public HSMUserId: string;
	public HSMPassword: string;
	public ISDCode: string;
	public businessContactNumber: string;
	public language: string;
	public tenantId: number;
	public providerTemplateId: number;
	public status: string;
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
			clientTemplateId: {
				allowNull: true,
				type: DataTypes.STRING,
			},
			HSMUserId: {
				allowNull: true,
				type: DataTypes.STRING,
			},
			HSMPassword: {
				allowNull: true,
				type: DataTypes.STRING,
			},
			ISDCode: {
				allowNull: true,
				type: DataTypes.STRING,
			},
			businessContactNumber: {
				allowNull: true,
				type: DataTypes.STRING,
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
				type: DataTypes.INTEGER,
				allowNull: true,
			},
		},
		{
			tableName: 'template',
			sequelize,
		},
	);

	return TemplateModel;
}
