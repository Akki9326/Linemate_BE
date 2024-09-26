import { DataTypes, Sequelize } from 'sequelize';
import { ButtonType, FlowType } from '../enums/template.enum';
import { AppDBModel, AppDB_Common_Fields } from './app-db.model';

export class TemplateContentButtonsModel extends AppDBModel {
	public id: number;
	public createdAt: Date;
	public updatedAt: Date;
	public createdBy: number;
	public updatedBy: number;
	public isActive: boolean;
	public isDeleted: boolean;
	public buttonType: string;
	public title: string;
	public websiteUrl: string;
	public isDynamicUrl: boolean;
	public navigateScreen: string;
	public initialScreen: string;
	public flowId: string;
	public flowAction: string;
	public flowToken: string;
	public isTrackUrl: boolean;
	public buttonId: string;
	public buttonDescription: string;
	public sectionId: number;
}

export default function (sequelize: Sequelize): typeof TemplateContentButtonsModel {
	TemplateContentButtonsModel.init(
		{
			...AppDB_Common_Fields,
			id: {
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.INTEGER,
			},

			buttonType: {
				allowNull: true,
				type: DataTypes.ENUM,
				values: Object.values(ButtonType),
			},
			title: {
				allowNull: true,
				type: DataTypes.STRING,
			},
			websiteUrl: {
				allowNull: true,
				type: DataTypes.STRING,
			},
			isDynamicUrl: {
				allowNull: true,
				type: DataTypes.BOOLEAN,
			},
			navigateScreen: {
				allowNull: true,
				type: DataTypes.STRING,
			},
			initialScreen: {
				allowNull: true,
				type: DataTypes.STRING,
			},
			isTrackUrl: {
				allowNull: true,
				type: DataTypes.BOOLEAN,
			},
			sectionId: {
				allowNull: true,
				type: DataTypes.INTEGER,
			},
			flowId: {
				allowNull: true,
				type: DataTypes.STRING,
			},
			buttonId: {
				allowNull: true,
				type: DataTypes.STRING,
			},
			buttonDescription: {
				allowNull: true,
				type: DataTypes.STRING,
			},
			additionalData: {
				allowNull: true,
				type: DataTypes.JSONB,
			},
			flowAction: {
				allowNull: true,
				type: DataTypes.ENUM,
				values: Object.values(FlowType),
			},
			flowToken: {
				allowNull: true,
				type: DataTypes.STRING,
			},
		},
		{
			tableName: 'templateContentButtons',
			sequelize,
		},
	);

	return TemplateContentButtonsModel;
}
