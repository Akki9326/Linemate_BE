import { DataTypes, Model, Sequelize } from 'sequelize';

export class AppDBModel extends Model {
  public isActive: boolean;
  public isDeleted: boolean;
  public createdBy: string;
  public createdAt: Date;
  public updatedBy: string;
  public updatedAt: Date;
}

export const AppDB_Common_Fields = {
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE,
    defaultValue: Sequelize.literal('now()'),

  },
  updatedAt: {
    allowNull: true,
    type: DataTypes.DATE,
    defaultValue: Sequelize.literal('now()'),
  },
  createdBy: {
    allowNull: false,
    type: DataTypes.STRING,
    defaultValue: 'System'
  },
  updatedBy: {
    allowNull: true,
    type: DataTypes.STRING,
  },
  isActive: {
    allowNull: false,
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  isDeleted: {
    allowNull: false,
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
};
