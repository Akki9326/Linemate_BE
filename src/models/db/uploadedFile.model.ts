import { DataTypes, Sequelize } from 'sequelize';
import { AppDB_Common_Fields, AppDBModel } from './app-db.model';

export class UploadedFileModel extends AppDBModel {
	public id: number;
	public name: string;
	public type: string;
	public size: number;
}

export default function (sequelize: Sequelize): typeof UploadedFileModel {
	UploadedFileModel.init(
		{
			...AppDB_Common_Fields,
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
			type: {
				allowNull: false,
				type: DataTypes.STRING,
			},
			size: {
				allowNull: true,
				type: DataTypes.INTEGER,
			},
		},
		{
			tableName: 'uploadedFiles',
			sequelize,
		},
	);

	return UploadedFileModel;
}
