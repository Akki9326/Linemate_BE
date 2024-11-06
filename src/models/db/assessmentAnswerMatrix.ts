import { DataTypes, Sequelize } from 'sequelize';
import { AppDBModel, AppDB_Common_Fields } from './app-db.model';
import { UserModel } from './users.model';

export class AssessmentResultModel extends AppDBModel {
	public id: number;
	public questionId: number;
	public userAnswerIds: number[];
	public assessmentResultId: number;
}

export default function (sequelize: Sequelize): typeof AssessmentResultModel {
	AssessmentResultModel.init(
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
				references: {
					model: 'assessmentQuestionMatrix',
					key: 'id',
				},
			},
			userAnswerIds: {
				type: DataTypes.ARRAY(DataTypes.INTEGER),
				allowNull: true,
				references: {
					model: 'assessmentOptionModel',
					key: 'id',
				},
			},
			assessmentResultId: {
				type: DataTypes.INTEGER,
				allowNull: true,
				references: {
					model: 'assessmentResult',
					key: 'id',
				},
			},
		},
		{
			tableName: 'assessmentAnswerMatrix',
			sequelize,
		},
	);
	AssessmentResultModel.belongsTo(UserModel, {
		foreignKey: 'createdBy',
		as: 'Creator',
	});

	AssessmentResultModel.belongsTo(UserModel, {
		foreignKey: 'updatedBy',
		as: 'Updater',
	});

	return AssessmentResultModel;
}
