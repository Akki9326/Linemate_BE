import { PasswordHelper } from '@/utils/helpers/password.helper';
import { DataTypes, Sequelize } from 'sequelize';
import { AppDBModel, AppDB_Common_Fields } from './app-db.model';

export class UserPasswordModel extends AppDBModel {
	public id: number;
	public userId: string;
	public password: string;

	hashPassword() {
		this.password = PasswordHelper.hashPassword(this.password);
	}

	validatePassword(unencryptedPassword: string) {
		return PasswordHelper.validatePassword(unencryptedPassword, this.password);
	}
}

export default function (sequelize: Sequelize): typeof UserPasswordModel {
	UserPasswordModel.init(
		{
			...AppDB_Common_Fields,
			id: {
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.INTEGER,
			},
			userId: {
				allowNull: false,
				type: DataTypes.STRING,
			},
			password: {
				allowNull: true,
				type: DataTypes.STRING(255),
			},
		},
		{
			tableName: 'usersPasswords',
			sequelize,
		},
	);

	return UserPasswordModel;
}
