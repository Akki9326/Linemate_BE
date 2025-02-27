import { Sequelize, DataTypes } from 'sequelize';
import { AppDBModel, AppDB_Common_Fields } from './app-db.model';
import { ClientTypes } from '../enums/client-type.enum';

export class TenantModel extends AppDBModel {
	public id: number;
	public name: string;
	public companyType: string;
	public trademark: string;
	public logo: string;
	public phoneNumber: number;
	public gstNumber: string;
	public currencyCode: string;
	public isdCode: number;
	public clientType: ClientTypes;
	public authorisedFirstName: string;
	public authorisedLastName: string;
	public authorisedEmail: string;
	public authorisedMobileNo: number;
	public companyAddress: string;
	public companyCountry: string;
	public companyState: string;
	public companyCity: string;
	public companyPinCode: number;
	public whitelistedIps: Array<string>;
	public whatsapp: boolean;
	public sms: boolean;
	public viber: boolean;
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
				type: DataTypes.STRING,
				allowNull: false,
			},
			companyType: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			trademark: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			logo: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			phoneNumber: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			gstNumber: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			currencyCode: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			isdCode: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			clientType: {
				type: DataTypes.ENUM,
				values: Object.values(ClientTypes),
			},
			authorisedFirstName: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			authorisedLastName: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			authorisedEmail: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			authorisedMobileNo: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			companyAddress: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			companyCountry: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			companyState: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			companyCity: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			companyPinCode: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
			whitelistedIps: {
				type: DataTypes.ARRAY(DataTypes.STRING),
				allowNull: true,
				defaultValue: [],
			},
			whatsapp: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			sms: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			viber: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
		},
		{
			tableName: 'tenant',
			sequelize,
		},
	);

	return TenantModel;
}
