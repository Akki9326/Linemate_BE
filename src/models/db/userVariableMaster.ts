import { DataTypes, Sequelize } from 'sequelize';
import { VariableCategories, VariableType } from '../enums/variable.enum';
import { AppDBModel, AppDB_Common_Fields } from './app-db.model';

export class UserVariableMasterModel extends AppDBModel {
    public id: number;
    public name: string;
    public isMandatory: boolean;
    public type: VariableType;
    public description: string;
    public placeHolder: string;
    public category: VariableCategories;
    public options: string[];
    public tenantId: number;
}

export default function (sequelize: Sequelize): typeof UserVariableMasterModel {
    UserVariableMasterModel.init(
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
            isMandatory: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            type: {
                type: DataTypes.ENUM,
                values: Object.values(VariableType),
                allowNull: false,
            },
            description: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            placeHolder: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            category: {
                type: DataTypes.ENUM,
                values: Object.values(VariableCategories),
                allowNull: false,
            },
            options: {
                type: DataTypes.ARRAY(DataTypes.STRING),
                defaultValue: []
            },
            tenantId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            }
        },
        {
            tableName: 'userVariableMaster',
            sequelize,
        },
    );

    return UserVariableMasterModel;
}
