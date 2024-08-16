import { DataTypes, Sequelize } from 'sequelize';
import { AppDBModel, AppDB_Common_Fields } from './app-db.model';
import { ScoringType } from '../enums/assessment.enum';

export class assessmentMasterModel extends AppDBModel {
	public id: number;
	public name: string;
	public description: string;
	public totalQuestion: number;
	public scoring: ScoringType;
	public timed: number;
	public pass: number;
	public score: number;
}

export default function (sequelize: Sequelize): typeof assessmentMasterModel {
	assessmentMasterModel.init(
		{
			...AppDB_Common_Fields,
			id: {
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.INTEGER,
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			description: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			totalQuestion: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			scoring: {
				type: DataTypes.ENUM,
				values: Object.values(ScoringType),
				allowNull: false,
			},
			timed: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			pass: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			score: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
		},
		{
			tableName: 'assessmentMaster',
			sequelize,
		},
	);

	return assessmentMasterModel;
}
