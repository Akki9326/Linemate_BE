import TenantModel from '@/models/db/tenant.model';
import ResetPasswordTokenModel from '@/models/db/reset-password-token.model';
import RoleModel from '@/models/db/role.model';
import UserModel from '@/models/db/users.model';
import { DB_DATABASE, DB_HOST, DB_PASSWORD, DB_PORT, DB_USER } from '@config';
import Sequelize from 'sequelize';

export const sequelizeConnect = new Sequelize.Sequelize(DB_DATABASE, DB_USER, DB_PASSWORD, {
  dialect: 'postgres',
  host: DB_HOST,
  port: parseInt(DB_PORT),
  database: DB_DATABASE,
  timezone: '+05:30',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  benchmark: false,
});

sequelizeConnect.authenticate();

const DB = {
  Roles: RoleModel(sequelizeConnect),
  Tenant: TenantModel(sequelizeConnect),
  Users: UserModel(sequelizeConnect),
  ResetPasswordToken: ResetPasswordTokenModel(sequelizeConnect),
  sequelizeConnect, // connection instance (RAW queries)
  Sequelize, // library
};
export default DB;
