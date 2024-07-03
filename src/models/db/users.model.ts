import { Sequelize, DataTypes } from 'sequelize';
import { AppDBModel, AppDB_Common_Fields } from './app-db.model';
import { RoleModel } from './role.model';
import { PasswordHelper } from '@/utils/helpers/password.helper';
import { TenantModel } from './tenant.model';
import { UserType } from '../enums/user-types.enum';

export class UserModel extends AppDBModel {
  public id: number;
  public username: string;
  public email: string;
  public password: string;
  public firstName: string;
  public lastName: string;
  public mobileNumber: string;
  public tenantId: number;
  public failedLoginAttempts: number;
  public lastLoggedInAt: Date;
  public userType: UserType;

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
      username: {
        allowNull: false,
        type: DataTypes.STRING,
        unique: false
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
        allowNull: true,
        type: DataTypes.STRING,
         unique: true
      },
      userType: {
         type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'userType',
          key: 'id'
        }
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      }
    },
    {
      tableName: 'users',
      sequelize,
    },
  );
    UserModel.belongsTo(TenantModel, {
    foreignKey: 'tenantId',
    as: 'tenant'
})


  return UserModel;
}
