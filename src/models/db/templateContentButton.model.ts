import { DataTypes, Sequelize } from 'sequelize';
import { AppDBModel, AppDB_Common_Fields } from './app-db.model';
import { ActionType, ButtonType, FlowType } from '../enums/template.enum';

export class TemplateContentButtonsModel extends AppDBModel {
	public id: number;
	public createdAt: Date;
	public updatedAt: Date;
	public createdBy: number;
	public updatedBy: number;
	public isActive: boolean;
	public isDeleted: boolean;
	public buttonType: string;
	public actionType: string;
	public title: string;
	public websiteUrl: string;
	public isDynamicUrl: boolean;
	public navigateScreen: string;
	public initialScreen: string;
	public flowId: string;
	public flowAction: string;
	public flowToken: string;
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
			actionType: {
				allowNull: true,
				type: DataTypes.ENUM,
				values: Object.values(ActionType),
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
			flowId: {
				allowNull: true,
				type: DataTypes.STRING,
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
