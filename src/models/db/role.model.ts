import { Sequelize, DataTypes } from 'sequelize';
import { AppDBModel, AppDB_Common_Fields } from './app-db.model';
import { PermissionModel } from './permissions.model';
import { UserModel } from './users.model';

export class RoleModel extends AppDBModel {
  public id: number;
  public name: string;
  public description: string;
  public type: string;
  public permissions?: PermissionModel[]
  public users?: UserModel[]
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
        allowNull: false,
        type: DataTypes.STRING,
      },
      type: {
        allowNull: false,
        type: DataTypes.ENUM('stander', 'custom')
      },
      permissionsIds: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        allowNull: true,
        references: {
          model: 'permissions',
          key: 'id'
        }
      },
      userIds: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      }
    },
    {
      tableName: 'role',
      sequelize,
    },
  );

  

  return RoleModel;
}
