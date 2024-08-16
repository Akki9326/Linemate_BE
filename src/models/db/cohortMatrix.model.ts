import { DataTypes, Sequelize } from 'sequelize';
import { AppDB_Common_Fields, AppDBModel } from './app-db.model';

export class CohortMatrixModel extends AppDBModel {
	public id: number;
	public userId: string;
	public cohortId: string;
}

export default function (sequelize: Sequelize): typeof CohortMatrixModel {
	CohortMatrixModel.init(
		{
			...AppDB_Common_Fields,
			id: {
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.INTEGER,
			},
			userId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: 'users',
					key: 'id',
				},
				onDelete: 'CASCADE',
			},
			cohortId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: 'cohortsMaster',
					key: 'id',
				},
				onDelete: 'CASCADE',
			},
		},
		{
			tableName: 'cohortsMatrix',
			sequelize,
		},
	);

	return CohortMatrixModel;
}
