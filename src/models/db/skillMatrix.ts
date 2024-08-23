import { DataTypes, Sequelize } from 'sequelize';
import { AppDBModel, AppDB_Common_Fields } from './app-db.model';

export class skillMatrixModel extends AppDBModel {
	public id: number;
	public contentId: number;
	public skill: string;
}

export default function (sequelize: Sequelize): typeof skillMatrixModel {
	skillMatrixModel.init(
		{
			...AppDB_Common_Fields,
			id: {
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.INTEGER,
			},
			contentId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			skill: {
				type: DataTypes.TEXT,
				allowNull: false,
			},
		},
		{
			tableName: 'skillMatrix',
			sequelize,
		},
	);

	return skillMatrixModel;
}
