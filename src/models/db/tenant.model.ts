import { Sequelize, DataTypes } from 'sequelize';
import { AppDBModel, AppDB_Common_Fields } from './app-db.model';

export class TenantModel extends AppDBModel {
  public id: number;
  public name: string;
}

export default function (sequelize: Sequelize): typeof TenantModel {
  TenantModel.init(
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
      email: {
        allowNull: false,
        type: DataTypes.STRING,
        unique: true
      },
    },
    {
      tableName: 'tenant',
      sequelize,
    },
  );

  return TenantModel;
}
