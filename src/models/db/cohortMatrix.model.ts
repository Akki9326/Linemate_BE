import { DataTypes, Sequelize } from 'sequelize';
import { AppDB_Common_Fields, AppDBModel } from './app-db.model';
import { UserModel } from './users.model';
import { CohortMasterModel } from './cohortMaster.model';

export class CohortMatrixModel extends AppDBModel {
	public id: number;
	public userId: string;
	public cohortId: number;
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
	CohortMatrixModel.belongsTo(UserModel, { foreignKey: 'userId' });
	UserModel.hasMany(CohortMatrixModel, { foreignKey: 'userId' });

	CohortMatrixModel.belongsTo(CohortMasterModel, { foreignKey: 'cohortId' });
	CohortMasterModel.hasMany(CohortMatrixModel, { foreignKey: 'cohortId', as: 'userMatrix' });

	// In CohortMatrixModel
	CohortMatrixModel.belongsTo(CohortMasterModel, { foreignKey: 'cohortId', as: 'cohortMaster' });
	return CohortMatrixModel;
}
