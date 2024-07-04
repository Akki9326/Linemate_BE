import PermissionModel from '@/models/db/permissions.model';
import RoleModel from '@/models/db/role.model';
import TenantModel from '@/models/db/tenant.model';
import UserPasswordModel from '@/models/db/userPassword.model';
import UserTokenModel from '@/models/db/userToken.model';
import UserModel from '@/models/db/users.model';
import { DB_DATABASE, DB_HOST, DB_PASSWORD, DB_PORT, DB_USER } from '@config';
import Sequelize from 'sequelize';

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

  UserPassword: UserPasswordModel(sequelizeConnect),
  UserToken: UserTokenModel(sequelizeConnect),
  Roles: RoleModel(sequelizeConnect),
  Tenant: TenantModel(sequelizeConnect),
  Permission: PermissionModel(sequelizeConnect),
  Users: UserModel(sequelizeConnect),
  sequelizeConnect, // connection instance (RAW queries)
  Sequelize, // library
};
export default DB;
