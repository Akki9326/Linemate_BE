import { DataTypes, Sequelize } from 'sequelize';
import { AppDB_Common_Fields, AppDBModel } from './app-db.model';

export class CohortMasterModel extends AppDBModel {
	public id: number;
	public name: string;
	public description: string;
	public userIds: number[];
	public tenantId: number;
}

export default function (sequelize: Sequelize): typeof CohortMasterModel {
	CohortMasterModel.init(
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
			},
			userIds: {
				type: DataTypes.ARRAY(DataTypes.INTEGER),
				allowNull: false,
				defaultValue: [],
			},
			description: {
				allowNull: true,
				type: DataTypes.STRING,
			},
			tenantId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
		},
		{
			tableName: 'cohortsMaster',
			sequelize,
		},
	);

	return CohortMasterModel;
}
