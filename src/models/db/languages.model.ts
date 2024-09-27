import { DataTypes, Sequelize, Model } from 'sequelize';

export class Languages extends Model {
	public id: number;
	public name: string;
	public code: string;
}

export default function (sequelize: Sequelize): typeof Languages {
	Languages.init(
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
			code: {
				allowNull: false,
				type: DataTypes.STRING,
			},
		},
		{
			tableName: 'languages',
			timestamps: false,
			sequelize,
		},
	);

	return Languages;
}
