import { DataTypes, Sequelize } from 'sequelize';
import { ResultType } from '../enums/assessment.enum';
import { AppDBModel, AppDB_Common_Fields } from './app-db.model';
import { UserModel } from './users.model';

export class AssessmentResult extends AppDBModel {
	public id: number;
	public userId: number;
	public assessmentId: number;
	public contentId: number;
	public totalScore: number;
	public resultType: ResultType;
	public startTime: Date;
	public endTime: Date;
	public correctAnswerCount: number;
	public wrongAnswerCount: number;
	public unAttemptQuestionCount: number;
}

export default function (sequelize: Sequelize): typeof AssessmentResult {
	AssessmentResult.init(
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
			},
			assessmentId: {
				type: DataTypes.INTEGER,
				allowNull: true,
				references: {
					model: 'assessmentMaster',
					key: 'id',
				},
			},
			contentId: {
				type: DataTypes.INTEGER,
				allowNull: true,
				references: {
					model: 'contents',
					key: 'id',
				},
			},
			totalScore: {
				type: DataTypes.INTEGER,
				allowNull: false,
				defaultValue: 0,
			},
			resultType: {
				type: DataTypes.ENUM,
				values: Object.values(ResultType),
				allowNull: true,
			},
			startTime: {
				type: DataTypes.DATE,
				allowNull: false,
			},
			endTime: {
				type: DataTypes.DATE,
				allowNull: true,
			},
			correctAnswerCount: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
			wrongAnswerCount: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
			unAttemptQuestionCount: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
		},
		{
			tableName: 'assessmentResult',
			sequelize,
		},
	);
	AssessmentResult.belongsTo(UserModel, {
		foreignKey: 'createdBy',
		as: 'Creator',
	});

	AssessmentResult.belongsTo(UserModel, {
		foreignKey: 'updatedBy',
		as: 'Updater',
	});

	return AssessmentResult;
}
