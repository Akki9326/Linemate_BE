import { DataTypes, Sequelize } from 'sequelize';
import { AppDBModel, AppDB_Common_Fields } from './app-db.model';

export class assessmentQuestionMatrixModel extends AppDBModel {
	public id: number;
	public assessmentId: number;
	public question: string;
	public optionIds: number[];
	public correctAnswer: number;
	public score: number;
	public type: string;
}

export default function (sequelize: Sequelize): typeof assessmentQuestionMatrixModel {
	assessmentQuestionMatrixModel.init(
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
				references: {
					model: 'assessmentMaster',
					key: 'id',
				},
			},
			question: {
				type: DataTypes.TEXT,
				allowNull: false,
			},
			type: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			optionIds: {
				type: DataTypes.ARRAY(DataTypes.STRING),
				defaultValue: [],
				references: {
					model: 'assessmentOption',
					key: 'id',
				},
			},
			correctAnswer: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
			score: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
		},
		{
			tableName: 'assessmentQuestionMatrix',
			sequelize,
		},
	);

	return assessmentQuestionMatrixModel;
}
