import { DataTypes, Model, Sequelize } from 'sequelize';

export class AppDBModel extends Model {
	public isActive: boolean;
	public isDeleted: boolean;
	public createdBy: number;
	public createdAt: Date;
	public updatedBy: number;
	public updatedAt: Date;
}

export const AppDB_Common_Fields = {
	createdAt: {
		allowNull: false,
		type: DataTypes.DATE,
		defaultValue: Sequelize.literal('now()'),
	},
	updatedAt: {
		allowNull: true,
		type: DataTypes.DATE,
		defaultValue: Sequelize.literal('now()'),
	},
	createdBy: {
		allowNull: false,
		type: DataTypes.INTEGER,
		defaultValue: 'System',
	},
	updatedBy: {
		allowNull: true,
		type: DataTypes.INTEGER,
	},
	isActive: {
		allowNull: false,
		type: DataTypes.BOOLEAN,
		defaultValue: true,
	},
	isDeleted: {
		allowNull: false,
		type: DataTypes.BOOLEAN,
		defaultValue: false,
	},
};
