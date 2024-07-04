import { PasswordHelper } from '@/utils/helpers/password.helper';
import { DataTypes, Sequelize } from 'sequelize';
import { UserType } from '../enums/user-types.enum';
import { AppDBModel, AppDB_Common_Fields } from './app-db.model';
import { TenantModel } from './tenant.model';

export class UserModel extends AppDBModel {
  public id: number;
  public username: string;
  public email: string;
  public password: string;
  public firstName: string;
  public lastName: string;
  public mobileNumber: string;
  public tenantIds: number[];
  public failedLoginAttempts: number;
  public lastLoggedInAt: Date;
  public userType: UserType;
  public isLocked: boolean;
  public isTemporaryPassword: boolean;



  hashPassword() {
    this.password = PasswordHelper.hashPassword(this.password)
  }

  validatePassword(unencryptedPassword: string) {
    return PasswordHelper.validatePassword(unencryptedPassword, this.password);
  }
}

export default function (sequelize: Sequelize): typeof UserModel {
  UserModel.init(
    {
      ...AppDB_Common_Fields,
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      email: {
        allowNull: false,
        type: DataTypes.STRING,
        unique: true
      },
      password: {
        allowNull: true,
        type: DataTypes.STRING(255),
      },
      firstName: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      lastName: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      failedLoginAttempts: {

        allowNull: false,
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      lastLoggedInAt: {
        allowNull: true,
        type: DataTypes.DATE
      },
      mobileNumber: {
        allowNull: false,
        type: DataTypes.STRING,
        unique: true
      },
      userType: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      tenantIds: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        defaultValue: [],
      },
      isLocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isTemporaryPassword: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    },
    {
      tableName: 'users',
      sequelize,
    },
  );



  return UserModel;
}
