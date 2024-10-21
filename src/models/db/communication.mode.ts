import { DataTypes, Sequelize } from 'sequelize';
import { AppDB_Common_Fields, AppDBModel } from './app-db.model';
import { Channel } from '../enums/template.enum';

export class CommunicationModel extends AppDBModel {
	public id: number;
	public fromNumber: string;
	public wabaId: string;
	public workSpaceName: string;
	public workSpaceId: number;
	public customName: string;
	public channel: string;
	public viberProvider: string;
	public domain: string;
	public sender: string;
	public accessToken: string;
	public integrationId: string;
}

export default function (sequelize: Sequelize): typeof CommunicationModel {
	CommunicationModel.init(
		{
			...AppDB_Common_Fields,
			id: {
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.INTEGER,
			},
			fromNumber: {
				allowNull: true,
				type: DataTypes.STRING,
			},
			wabaId: {
				allowNull: true,
				type: DataTypes.STRING,
			},
			channel: {
				allowNull: true,
				type: DataTypes.ENUM,
				values: Object.values(Channel),
			},
			integrationId: {
				allowNull: true,
				type: DataTypes.STRING,
			},
			workSpaceId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: 'users',
					key: 'id',
				},
				onDelete: 'CASCADE',
			},
			customName: {
				allowNull: true,
				type: DataTypes.STRING,
			},
			viberProvider: {
				allowNull: true,
				type: DataTypes.STRING,
			},
			domain: {
				allowNull: true,
				type: DataTypes.STRING,
			},
			sender: {
				allowNull: true,
				type: DataTypes.STRING,
			},
			accessToken: {
				allowNull: true,
				type: DataTypes.STRING,
			},
		},
		{
			tableName: 'communication',
			sequelize,
		},
	);

	return CommunicationModel;
}
