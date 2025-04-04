'use strict'

export default (sequelize, DataTypes) => {
  const GameProvider = sequelize.define('GameProvider', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false
    },
    providerId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      unique: true,
      allowNull: false
    },
    gameAggregatorId: {
      type: DataTypes.BIGINT,
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
    },
    gameCount: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'game_count'
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: true
    }

  }, {
    sequelize,
    underscored: true,
    tableName: 'game_providers',
    schema: 'public',
    timestamps: true
  })
  GameProvider.associate = function (model) {
    GameProvider.hasMany(model.CasinoGame, {
      foreignKey: 'providerId'
    })
    GameProvider.belongsTo(model.GameAggregator, {
      foreignKey: 'gameAggregatorId'
    })
  }

  return GameProvider
}
