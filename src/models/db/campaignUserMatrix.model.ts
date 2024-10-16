import { DataTypes, Sequelize } from 'sequelize';
import { AppDB_Common_Fields, AppDBModel } from './app-db.model';
import { UserModel } from './users.model';
import { CampaignMasterModel } from './campaignMastel';

export class CampaignUserMatrixModel extends AppDBModel {
	public id: number;
	public userId: string;
	public campaignId: number;
}

export default function (sequelize: Sequelize): typeof CampaignUserMatrixModel {
	CampaignUserMatrixModel.init(
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
				onDelete: 'CASCADE',
			},
			campaignId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: 'campaignMaster',
					key: 'id',
				},
				onDelete: 'CASCADE',
			},
		},
		{
			tableName: 'campaignUserMatrix',
			sequelize,
		},
	);
	CampaignUserMatrixModel.belongsTo(UserModel, { foreignKey: 'userId' });
	UserModel.hasMany(CampaignUserMatrixModel, { foreignKey: 'userId' });

	CampaignUserMatrixModel.belongsTo(CampaignMasterModel, { foreignKey: 'campaignId' });
	CampaignMasterModel.hasMany(CampaignUserMatrixModel, { foreignKey: 'campaignId', as: 'userMatrix' });

	// In CampaignUserMatrixModel
	CampaignUserMatrixModel.belongsTo(CampaignMasterModel, { foreignKey: 'campaignId', as: 'campaignMaster' });
	return CampaignUserMatrixModel;
}
