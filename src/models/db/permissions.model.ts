import { DataTypes, Sequelize } from 'sequelize';
import { AppPermission } from '../enums/app-access.enum';
import { AppDBModel, AppDB_Common_Fields } from './app-db.model';
import { PermissionType } from '../enums/permissions.enum';


export class PermissionModel extends AppDBModel {
  public id: number;
  public name: AppPermission;
  public type: PermissionType;
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
        type: DataTypes.ENUM,
        values: Object.values(PermissionType)
      },
      parentId: {
        allowNull: true,
        type: DataTypes.INTEGER,
      },
      description: {
        allowNull: true,
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
