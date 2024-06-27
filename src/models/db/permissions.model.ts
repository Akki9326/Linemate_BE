import { Sequelize, DataTypes } from 'sequelize';
import { AppDBModel, AppDB_Common_Fields } from './app-db.model';
import { AppPermission } from '../enums/app-access.enum';
import { RoleModel } from './role.model';

export class PermissionModel extends AppDBModel {
  public id: number;
  public name: AppPermission;
  public type: string;
  public parentId: number;
  public description: string;
}

export default function (sequelize: Sequelize): typeof PermissionModel {
  PermissionModel.init(
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
        unique: true,
      },
      type: {
        allowNull: false,
        type: DataTypes.ENUM('tenantId', 'custom')
      },
      parentId: {
        allowNull: true,
        type: DataTypes.INTEGER,
      },
      description: {
        allowNull: false,
        type: DataTypes.STRING,
      },
    },
    {
      tableName: 'permissions',
      sequelize,
    },
  );

  return PermissionModel;
}
