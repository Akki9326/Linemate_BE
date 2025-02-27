import { DataTypes, Sequelize } from 'sequelize';
import { ConteTypes } from '../enums/contentType.enum';
import { AppDB_Common_Fields, AppDBModel } from './app-db.model';
import { UserModel } from './users.model';

export class ContentModel extends AppDBModel {
	public id: number;
	public name: string;
	public type: string;
	public description: string;
	public tenantId: number;
	public assessmentId: number;
	public uploadedFileIds: number[];
	public isPublish: boolean;
	public isArchive: boolean;
}

export default function (sequelize: Sequelize): typeof ContentModel {
	ContentModel.init(
		{
			...AppDB_Common_Fields,
			id: {
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.INTEGER,
			},
			name: {
				allowNull: false,
				type: DataTypes.STRING,
				unique: true,
			},
			type: {
				allowNull: false,
				type: DataTypes.ENUM,
				values: Object.values(ConteTypes),
			},
			description: {
				allowNull: true,
				type: DataTypes.STRING,
			},
			tenantId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			assessmentId: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
			uploadedFileIds: {
				type: DataTypes.ARRAY(DataTypes.INTEGER),
				allowNull: true,
				defaultValue: [],
			},
			isPublish: {
				allowNull: false,
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			isArchive: {
				allowNull: false,
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
		},
		{
			tableName: 'contents',
			sequelize,
		},
	);
	ContentModel.belongsTo(UserModel, { foreignKey: 'createdBy', as: 'Creator' });
	UserModel.hasOne(ContentModel, { foreignKey: 'id' });

	return ContentModel;
}
