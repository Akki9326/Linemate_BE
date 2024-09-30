import { DataTypes, Sequelize } from 'sequelize';
import { AppDBModel, AppDB_Common_Fields } from './app-db.model';

export class TemplateContentButtonsSectionModel extends AppDBModel {
	public id: number;
	public createdAt: Date;
	public updatedAt: Date;
	public createdBy: number;
	public updatedBy: number;
	public isActive: boolean;
	public isDeleted: boolean;
	public name: string;
}

export default function (sequelize: Sequelize): typeof TemplateContentButtonsSectionModel {
	TemplateContentButtonsSectionModel.init(
		{
			...AppDB_Common_Fields,
			id: {
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.INTEGER,
			},
			name: {
				allowNull: true,
				type: DataTypes.STRING,
			},
		},
		{
			tableName: 'templateContentButtonsSection',
			sequelize,
		},
	);

	return TemplateContentButtonsSectionModel;
}
