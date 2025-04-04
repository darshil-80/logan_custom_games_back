'use strict'

export default (sequelize, DataTypes) => {
  const Game = sequelize.define('Game', {
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
    tableName: 'games',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: 'games_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      }
    ]
  })
  Game.associate = function (model) {
    Game.hasMany(model.Transaction, {
      foreignKey: 'gameId'
    })

    Game.hasOne(model.CustomFavouriteGame, {
      foreignKey: 'customGameId'
    })
  }

  return Game
}
