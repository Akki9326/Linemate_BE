import { DataTypes, Sequelize } from 'sequelize';
import { ActionType, ContentSubType, ContentType, HeaderType, MediaType, MessageType } from '../enums/template.enum';
import { AppDBModel, AppDB_Common_Fields } from './app-db.model';
import { TemplateModel } from './template.model';

export class TemplateContentModel extends AppDBModel {
	public id: number;
	public createdAt: Date;
	public updatedAt: Date;
	public createdBy: number;
	public updatedBy: number;
	public isActive: boolean;
	public isDeleted: boolean;
	public contentType: string;
	public headerType: string;
	public headerContent: string | null;
	public headerPlaceHolder: number[];
	public headerMediaType: string;
	public body: string;
	public bodyPlaceHolder: number[];
	public footer: string;
	public contentUrl: string;
	public caption: string;
	public latitude: number;
	public longitude: number;
	public address: string;
	public isPreviewUrl: boolean;
	public messageType: string;
	public buttonIds: number[];
	public contentSubType: string;
	public additionalData: string;
	public locationName: string;
	public headerMediaUrl: string;
	public actionType: string;
	public menuButtonName: string;
	public templateId: number;
}

export default function (sequelize: Sequelize): typeof TemplateContentModel {
	TemplateContentModel.init(
		{
			...AppDB_Common_Fields,
			id: {
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.INTEGER,
			},
			contentType: {
				allowNull: true,
				type: DataTypes.ENUM,
				values: Object.values(ContentType),
			},
			headerType: {
				allowNull: true,
				type: DataTypes.ENUM,
				values: Object.values(HeaderType),
			},
			actionType: {
				allowNull: true,
				type: DataTypes.ENUM,
				values: Object.values(ActionType),
			},
			headerContent: {
				allowNull: true,
				type: DataTypes.STRING,
			},
			menuButtonName: {
				allowNull: true,
				type: DataTypes.STRING,
			},
			headerPlaceHolder: {
				allowNull: true,
				type: DataTypes.ARRAY(DataTypes.INTEGER),
				defaultValue: [],
			},
			headerMediaType: {
				allowNull: true,
				type: DataTypes.ENUM,
				values: Object.values(MediaType),
			},
			body: {
				allowNull: true,
				type: DataTypes.STRING(1032),
			},
			bodyPlaceHolder: {
				allowNull: true,
				type: DataTypes.ARRAY(DataTypes.INTEGER),
				defaultValue: [],
			},
			footer: {
				allowNull: true,
				type: DataTypes.STRING(60),
			},
			contentUrl: {
				allowNull: true,
				type: DataTypes.TEXT,
			},
			caption: {
				allowNull: true,
				type: DataTypes.STRING(200),
			},
			headerMediaUrl: {
				allowNull: true,
				type: DataTypes.STRING,
			},
			latitude: {
				allowNull: true,
				type: DataTypes.DECIMAL(9, 6),
			},
			longitude: {
				allowNull: true,
				type: DataTypes.DECIMAL(9, 6),
			},
			address: {
				allowNull: true,
				type: DataTypes.STRING(),
			},
			messageText: {
				allowNull: true,
				type: DataTypes.STRING(),
			},
			isPreviewUrl: {
				allowNull: true,
				type: DataTypes.BOOLEAN,
			},
			messageType: {
				allowNull: true,
				type: DataTypes.ENUM,
				values: Object.values(MessageType),
			},
			buttonIds: {
				allowNull: true,
				type: DataTypes.ARRAY(DataTypes.INTEGER),
			},
			contentSubType: {
				allowNull: true,
				type: DataTypes.ENUM,
				values: Object.values(ContentSubType),
			},
			locationName: {
				allowNull: true,
				type: DataTypes.STRING,
			},
			templateId: {
				allowNull: false,
				type: DataTypes.INTEGER,
				references: {
					model: 'template',
					key: 'id',
				},
				onDelete: 'CASCADE',
			},
		},
		{
			tableName: 'templateContent',
			sequelize,
		},
	);

	TemplateContentModel.belongsTo(TemplateModel, { foreignKey: 'templateId' });
	TemplateModel.hasMany(TemplateContentModel, { foreignKey: 'templateId', as: 'templateContent' });

	return TemplateContentModel;
}
