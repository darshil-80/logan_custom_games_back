'use strict'

export default (sequelize, DataTypes) => {
  const NuxGame = sequelize.define('NuxGame', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false
    },
    gameId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    basicRtp: {
      type: DataTypes.STRING,
      allowNull: true
    },
    providerId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    gameAggregatorId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    img: {
      type: DataTypes.STRING,
      allowNull: true
    },
    imgVertical: {
      type: DataTypes.STRING,
      allowNull: true
    },
    demo: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    device: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'nux_games',
    schema: 'public',
    timestamps: true
  })
  NuxGame.associate = function (model) {
    NuxGame.belongsTo(model.GameProvider, {
      foreignKey: 'providerId'
    })
    NuxGame.belongsTo(model.GameAggregator, {
      foreignKey: 'gameAggregatorId'
    })
    NuxGame.hasMany(model.CasinoTransaction, {
      foreignKey: 'gameId'
    })
    NuxGame.hasOne(model.FavouriteGame, {
      foreignKey: 'gameId'
    })
  }

  return NuxGame
}
