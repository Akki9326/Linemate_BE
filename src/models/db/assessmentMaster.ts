import { DataTypes, Sequelize } from 'sequelize';
import { AppDBModel, AppDB_Common_Fields } from './app-db.model';
import { ScoringType } from '../enums/assessment.enum';

export class assessmentMasterModel extends AppDBModel {
	public id: number;
	public name: string;
	public description: string;
	public totalQuestion: number;
	public scoring: ScoringType;
	public contentId: number;
	public timed: number;
	public pass: number;
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
			contentId: {
				type: DataTypes.INTEGER,
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
		},
		{
			tableName: 'assessmentMaster',
			sequelize,
		},
	);

	return assessmentMasterModel;
}
