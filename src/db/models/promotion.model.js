'use strict'

export default (sequelize, DataTypes) => {
  const Promotion = sequelize.define('Promotion', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    prize: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    imageBanner: {
      type: DataTypes.STRING,
      allowNull: true
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'promotions',
    schema: 'public',
    timestamps: true
  })

  return Promotion
}
