import { DataTypes, Sequelize } from 'sequelize';
import { AppDBModel, AppDB_Common_Fields } from './app-db.model';

export class assessmentOptionModel extends AppDBModel {
	public id: number;
	public questionId: number;
	public option: string;
	public isCorrectAnswer: boolean;
}

export default function (sequelize: Sequelize): typeof assessmentOptionModel {
	assessmentOptionModel.init(
		{
			...AppDB_Common_Fields,
			id: {
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.INTEGER,
			},
			questionId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			option: {
				type: DataTypes.TEXT,
				allowNull: false,
			},
			isCorrectAnswer: {
				allowNull: false,
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
		},
		{
			tableName: 'assessmentOption',
			sequelize,
		},
	);

	return assessmentOptionModel;
}
