'use strict'

export default (sequelize, DataTypes) => {
  const CustomFavouriteGame = sequelize.define('CustomFavouriteGame', {
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
    customGameId: {
      type: DataTypes.BIGINT,
      allowNull: false
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'custom_favourite_games',
    schema: 'public',
    timestamps: true
  })
  CustomFavouriteGame.associate = function (model) {
    CustomFavouriteGame.belongsTo(model.User, {
      foreignKey: 'userId'
    })
    CustomFavouriteGame.belongsTo(model.Game, {
      foreignKey: 'customGameId'
    })
  }

  return CustomFavouriteGame
}
