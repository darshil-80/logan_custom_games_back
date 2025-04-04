'use strict'

export default (sequelize, DataTypes) => {
  const GameAggregator = sequelize.define('GameAggregator', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'game_aggregators',
    schema: 'public',
    timestamps: true
  })
  GameAggregator.associate = function (model) {
    GameAggregator.hasMany(model.GameProvider, { foreignKey: 'gameAggregatorId' })
    GameAggregator.hasMany(model.CasinoGame, { foreignKey: 'gameAggregatorId' })
  }

  return GameAggregator
}
