'use strict'

export default (sequelize, DataTypes) => {
  const RankingLevel = sequelize.define('RankingLevel', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    rank: {
      type: DataTypes.STRING,
      allowNull: false
    },
    wagerRequirement: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    imageLogo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    moreDetails: {
      type: DataTypes.JSONB,
      allowNull: true
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'ranking_level',
    schema: 'public',
    timestamps: true
  })

  return RankingLevel
}
