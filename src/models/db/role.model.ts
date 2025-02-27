import { DataTypes, Sequelize } from 'sequelize';
import { RoleType } from '../enums/role.enum';
import { AppDBModel, AppDB_Common_Fields } from './app-db.model';

export class RoleModel extends AppDBModel {
	public id: number;
	public name: string;
	public description: string;
	public type: RoleType;
	public permissionsIds?: number[];
	public userIds?: number[];
	public tenantId?: number;
}

export default function (sequelize: Sequelize): typeof RoleModel {
	RoleModel.init(
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
			type: {
				allowNull: false,
				type: DataTypes.ENUM,
				values: Object.values(RoleType),
			},
			permissionsIds: {
				type: DataTypes.ARRAY(DataTypes.INTEGER),
				allowNull: false,
				defaultValue: [],
			},
			userIds: {
				type: DataTypes.ARRAY(DataTypes.INTEGER),
				allowNull: false,
				defaultValue: [],
			},
			tenantId: {
				type: DataTypes.INTEGER,
				allowNull: true,
				references: {
					model: 'tenant',
					key: 'id',
				},
			},
		},
		{
			tableName: 'role',
			sequelize,
		},
	);

	return RoleModel;
}
