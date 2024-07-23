import { DataTypes, Model, Sequelize } from 'sequelize';

export class UploadedFileModel extends Model {
	public id: number;
	public name: string;
	public type: string;
	public description: string;
	public tenantId: number;
	public uploadedFileIds: number[];
	public isPublish: boolean;
}

export default function (sequelize: Sequelize): typeof UploadedFileModel {
	UploadedFileModel.init(
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
			type: {
				allowNull: false,
				type: DataTypes.STRING,
			},
			size: {
				allowNull: true,
				type: DataTypes.INTEGER,
			},
			s3Key: {
				type: DataTypes.STRING,
				allowNull: false,
			},
		},
		{
			tableName: 'uploadedFile',
			timestamps: false,
			sequelize,
		},
	);

	return UploadedFileModel;
}
