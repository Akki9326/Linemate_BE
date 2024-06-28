import TenantModel from '@/models/db/tenant.model';
import ResetPasswordTokenModel from '@/models/db/reset-password-token.model';
import RoleModel from '@/models/db/role.model';
import UserModel from '@/models/db/users.model';
import { DB_DATABASE, DB_HOST, DB_PASSWORD, DB_PORT, DB_USER } from '@config';
import Sequelize from 'sequelize';
import PermissionModel from '@/models/db/permissions.model';
import UserTypeModel  from '@/models/db/userType.model';
  console.log('DB_DATABASE :>> ', DB_DATABASE);
  console.log('DB_USER :>> ', DB_USER);
  console.log('DB_PASSWORD :>> ', DB_PASSWORD);
export const sequelizeConnect = new Sequelize.Sequelize(DB_DATABASE, DB_USER, DB_PASSWORD, {
  dialect: 'postgres',
  host: DB_HOST,
  port: parseInt(DB_PORT),
  database: DB_DATABASE,
  timezone: '+05:30',
  // dialectOptions: {
  //   ssl: {
  //     require: true,
  //     rejectUnauthorized: false,
  //   },
  // },
  benchmark: false,
});

sequelizeConnect.authenticate();

const DB = {

  UserType: UserTypeModel(sequelizeConnect),
  Roles: RoleModel(sequelizeConnect),
  Tenant: TenantModel(sequelizeConnect),
  Permission: PermissionModel(sequelizeConnect),
  Users: UserModel(sequelizeConnect),
  ResetPasswordToken: ResetPasswordTokenModel(sequelizeConnect),
  sequelizeConnect, // connection instance (RAW queries)
  Sequelize, // library
};
export default DB;
