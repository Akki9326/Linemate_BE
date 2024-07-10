import { DataTypes, Sequelize } from 'sequelize';
import { AppDBModel, AppDB_Common_Fields } from './app-db.model';

export class UserVariableMatrixModel extends AppDBModel {
    public id: number;
    public userId: number;
    public tenantId: number;
    public variableId: number;
    public value: string;
}

export default function (sequelize: Sequelize): typeof UserVariableMatrixModel {
    UserVariableMatrixModel.init(
        {
            ...AppDB_Common_Fields,
            id: {
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER,
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            variableId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            value: {
                type: DataTypes.STRING,
                allowNull: false,
                get() {
                    const rawValue = this.getDataValue('value');
                    try {
                        return JSON.parse(rawValue);
                    } catch (e) {
                        return rawValue;
                    }
                },
                set(value: string | string[]) {
                    if (Array.isArray(value)) {
                        this.setDataValue('value', JSON.stringify(value));
                    } else {
                        this.setDataValue('value', value);
                    }
                },
            },
            tenantId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },


        },
        {
            tableName: 'userVariableMatrix',
            sequelize,
        },
    );

    return UserVariableMatrixModel;
}
