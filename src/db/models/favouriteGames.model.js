'use strict'

export default (sequelize, DataTypes) => {
  const FavouriteGame = sequelize.define('FavouriteGame', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    gameId: {
      type: DataTypes.BIGINT,
      allowNull: false
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'favourite_games',
    schema: 'public',
    timestamps: true
  })
  FavouriteGame.associate = function (model) {
    FavouriteGame.belongsTo(model.User, {
      foreignKey: 'userId'
    })
    FavouriteGame.belongsTo(model.CasinoGame, {
      foreignKey: 'gameId',
      targetKey: 'id'
    })
  }

  return FavouriteGame
}
