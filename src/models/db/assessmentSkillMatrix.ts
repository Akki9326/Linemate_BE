import { DataTypes, Sequelize } from 'sequelize';
import { AppDBModel, AppDB_Common_Fields } from './app-db.model';

export class assessmentSkillMatrixModel extends AppDBModel {
	public id: number;
	public assessmentId: number;
	public skill: string;
}

export default function (sequelize: Sequelize): typeof assessmentSkillMatrixModel {
	assessmentSkillMatrixModel.init(
		{
			...AppDB_Common_Fields,
			id: {
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.INTEGER,
			},
			assessmentId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			skill: {
				type: DataTypes.TEXT,
				allowNull: false,
			},
		},
		{
			tableName: 'assessmentSkillMatrix',
			sequelize,
		},
	);

	return assessmentSkillMatrixModel;
}
