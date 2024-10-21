import { DataTypes, Sequelize } from 'sequelize';
import { AppDB_Common_Fields, AppDBModel } from './app-db.model';

export class WorkSpaceModel extends AppDBModel {
	public id: number;
	public fynoWorkSpaceName: string;
	public fynoWorkSpaceId: string;
	public tenantId: number;
}

export default function (sequelize: Sequelize): typeof WorkSpaceModel {
	WorkSpaceModel.init(
		{
			...AppDB_Common_Fields,
			id: {
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.INTEGER,
			},
			fynoWorkSpaceName: {
				allowNull: true,
				type: DataTypes.STRING,
			},
			fynoWorkSpaceId: {
				allowNull: true,
				type: DataTypes.STRING,
			},
			tenantId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
		},
		{
			tableName: 'workSpace',
			sequelize,
		},
	);

	return WorkSpaceModel;
}
