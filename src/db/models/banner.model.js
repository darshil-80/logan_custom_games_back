'use strict'
export default (sequelize, DataTypes) => {
  const Banner = sequelize.define('Banner', {
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
    bannerType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    isMobile: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    mobileImageUrl: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'banners',
    schema: 'public',
    timestamps: true
  })

  return Banner
}
