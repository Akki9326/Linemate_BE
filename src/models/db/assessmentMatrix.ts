import { DataTypes, Sequelize } from 'sequelize';
import { AppDBModel, AppDB_Common_Fields } from './app-db.model';

export class assessmentMatrixModel extends AppDBModel {
	public id: number;
	public assessmentId: number;
	public question: string;
	public optionIds: number[];
	public correctAnswer: number;
	public score: number;
}

export default function (sequelize: Sequelize): typeof assessmentMatrixModel {
	assessmentMatrixModel.init(
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
			question: {
				type: DataTypes.TEXT,
				allowNull: false,
			},
			optionIds: {
				type: DataTypes.ARRAY(DataTypes.STRING),
				defaultValue: [],
			},
			correctAnswer: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			score: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
		},
		{
			tableName: 'assessmentMatrix',
			sequelize,
		},
	);

	return assessmentMatrixModel;
}
