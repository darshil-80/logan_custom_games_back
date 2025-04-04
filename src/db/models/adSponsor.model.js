'use strict'
export default (sequelize, DataTypes) => {
  const AdSponsor = sequelize.define('AdSponsor', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    redirectUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'ad_sponsors',
    schema: 'public',
    timestamps: true
  })

  return AdSponsor
}
