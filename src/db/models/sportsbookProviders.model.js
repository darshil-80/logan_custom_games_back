'use strict'

export default (sequelize, DataTypes) => {
  const SportsbookProvider = sequelize.define('SportsbookProvider', {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      unique: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'sportsbook_providers',
    schema: 'public',
    timestamps: true
  })

  return SportsbookProvider
}
