'use strict'

export default (sequelize, DataTypes) => {
  const SportsbookBetslips = sequelize.define('SportsbookBetslips', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false
    },
    betslipId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    betbyPlayerId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    playerId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    sum: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    timestamp: {
      type: DataTypes.FLOAT,
      allowNull: false
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'sportsbook_betslips',
    schema: 'public',
    timestamps: true
  })

  return SportsbookBetslips
}
