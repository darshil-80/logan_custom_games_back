'use strict'

export default (sequelize, DataTypes) => {
  const SportsbookBets = sequelize.define('SportsbookBets', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false
    },
    betId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    eventId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    sportId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tournamentId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    categoryId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    live: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    sportName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    betDetails: {
      type: DataTypes.JSONB,
      allowNull: true
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'sportsbook_bets',
    schema: 'public',
    timestamps: true
  })

  return SportsbookBets
}
