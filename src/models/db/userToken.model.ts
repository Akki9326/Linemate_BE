import { DataTypes, Sequelize } from 'sequelize';
import { AppDBModel, AppDB_Common_Fields } from './app-db.model';
import { TokenTypes } from '../enums/tokenType';

export class UserTokenModel extends AppDBModel {
  public id: number;
  public userId: number;
  public token: string;
  public tokenType: TokenTypes;
  public expiresAt: Date;
  public retryCount: number;
}

export default function (sequelize: Sequelize): typeof UserTokenModel {
  UserTokenModel.init(
    {
      ...AppDB_Common_Fields,
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      userId: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      token: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tokenType: {
        allowNull: false,
        type: DataTypes.ENUM,
        values: Object.values(TokenTypes)
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      retryCount: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
    },
    {
      tableName: 'userToken',
      sequelize,
    },
  );

  return UserTokenModel;
}
