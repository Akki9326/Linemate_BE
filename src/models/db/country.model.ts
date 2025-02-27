import { DataTypes, Sequelize, Model } from 'sequelize';

export class CountryModel extends Model {
	public id: number;
	public name: string;
	public isdCode: string;
}

export default function (sequelize: Sequelize): typeof CountryModel {
	CountryModel.init(
		{
			id: {
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.INTEGER,
			},
			name: {
				allowNull: false,
				type: DataTypes.STRING,
				unique: true,
			},
			isdCode: {
				allowNull: false,
				type: DataTypes.STRING,
			},
		},
		{
			tableName: 'countries',
			timestamps: false,
			sequelize,
		},
	);

	return CountryModel;
}
