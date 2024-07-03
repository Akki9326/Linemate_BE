import { AppDBModel, AppDB_Common_Fields } from './app-db.model';
import { UserModel } from './users.model';
import { Sequelize, DataTypes } from 'sequelize';



export class ResetPasswordTokenModel extends AppDBModel {
    public id: number;
    public userId: number;
    public token: string;
    public expireTime: number
}

export default function (sequelize: Sequelize): typeof ResetPasswordTokenModel {
    ResetPasswordTokenModel.init(
        {
            createdAt: {
                allowNull: false,
                type: DataTypes.DATE,
            },
            updatedAt: {
                allowNull: true,
                type: DataTypes.DATE,
            },
            id: {
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER,
            },
            userId: {
                allowNull: false,
                type: DataTypes.INTEGER,
            },
            token: {
                allowNull: false,
                type: DataTypes.STRING,
            },
            expireTime: {
                allowNull: false,
                type: DataTypes.BIGINT,
            },
            isActive: {
                defaultValue: true,
                type: DataTypes.BOOLEAN,
            }
        },
        {
            tableName: 'resetPasswordToken',
            sequelize,
        },
    );

    ResetPasswordTokenModel.belongsTo(UserModel, {
        foreignKey: 'userId',
        as: 'users'
    })

    return ResetPasswordTokenModel;
}