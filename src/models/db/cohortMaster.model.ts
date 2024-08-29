import { DataTypes, Sequelize } from 'sequelize';
import { AppDB_Common_Fields, AppDBModel } from './app-db.model';

export class CohortMasterModel extends AppDBModel {
	public id: number;
	public name: string;
	public description: string;
	public rules: object[];
	isExistingRuleProcess: boolean;
	public tenantId: number;
}

export default function (sequelize: Sequelize): typeof CohortMasterModel {
	CohortMasterModel.init(
		{
			...AppDB_Common_Fields,
			id: {
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.INTEGER,
			},
			name: {
				allowNull: false,
				type: DataTypes.STRING,
			},
			description: {
				allowNull: true,
				type: DataTypes.STRING,
			},
			tenantId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			rules: {
				type: DataTypes.JSONB,
				allowNull: true,
			},
			isExistingRuleProcess: {
				type: DataTypes.BOOLEAN,
				allowNull: true,
				defaultValue: false,
			},
		},
		{
			tableName: 'cohortsMaster',
			sequelize,
		},
	);

	return CohortMasterModel;
}
