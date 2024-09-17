import { DataTypes, Sequelize } from 'sequelize';
import { AppDBModel, AppDB_Common_Fields } from './app-db.model';
import { CardMediaType } from '../enums/template.enum';

export class TemplateContentCardsModel extends AppDBModel {
	public id: number;
	public createdAt: Date;
	public updatedAt: Date;
	public createdBy: number;
	public updatedBy: number;
	public isActive: boolean;
	public isDeleted: boolean;
	public mediaType: string;
	public contentUrl: string;
	public body: string;
	public bodyPlaceHolder: number[];
	public buttonIds: number[];
}

export default function (sequelize: Sequelize): typeof TemplateContentCardsModel {
	TemplateContentCardsModel.init(
		{
			...AppDB_Common_Fields,
			id: {
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.INTEGER,
			},
			createdAt: {
				allowNull: false,
				type: DataTypes.DATE,
				defaultValue: DataTypes.NOW,
			},
			updatedAt: {
				allowNull: true,
				type: DataTypes.DATE,
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
			isActive: {
				allowNull: false,
				type: DataTypes.BOOLEAN,
				defaultValue: true,
			},
			isDeleted: {
				allowNull: false,
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			mediaType: {
				allowNull: true,
				type: DataTypes.ENUM,
				values: Object.values(CardMediaType),
			},
			contentUrl: {
				allowNull: true,
				type: DataTypes.TEXT,
			},
			body: {
				allowNull: true,
				type: DataTypes.STRING,
			},
			bodyPlaceHolder: {
				allowNull: true,
				type: DataTypes.ARRAY(DataTypes.INTEGER),
				defaultValue: [],
			},
			buttonIds: {
				allowNull: true,
				type: DataTypes.ARRAY(DataTypes.INTEGER),
			},
			templateContentId: {
				allowNull: false,
				type: DataTypes.INTEGER,
				references: {
					model: 'templateContent',
					key: 'id',
				},
				onDelete: 'CASCADE',
			},
		},
		{
			tableName: 'templateContentCards',
			sequelize,
		},
	);

	return TemplateContentCardsModel;
}
