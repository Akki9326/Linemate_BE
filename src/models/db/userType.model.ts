import { DataTypes, Sequelize } from 'sequelize';
import { AppDBModel, AppDB_Common_Fields } from './app-db.model';

export class UserTypeModel extends AppDBModel {
  public id: number;
  public type: string;
  public roleId: number;
}

export default function (sequelize: Sequelize): typeof UserTypeModel {
  UserTypeModel.init(
    {
      ...AppDB_Common_Fields,
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      type: {
        allowNull: false,
        type: DataTypes.STRING,
        unique: true
      },
      roleId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'role',
          key: 'id'
        }
      },
    },
    {
      tableName: 'userType',
      sequelize,
    },
  );

  return UserTypeModel;
}
