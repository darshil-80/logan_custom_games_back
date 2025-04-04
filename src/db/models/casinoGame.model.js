'use strict'

export default (sequelize, DataTypes) => {
  const CasinoGame = sequelize.define('CasinoGame', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      primaryKey: true,
      unique: true
    },
    casinoGameId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    earGameId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    productType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    gameCategoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'game_category',
        key: 'id'
      }
    },
    gameName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    hasDemo: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    similarGameCategory: {
      type: DataTypes.STRING,
      allowNull: true
    },
    providerId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    gameAggregatorId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'casino_game',
    schema: 'public',
    timestamps: true
  })
  CasinoGame.associate = function (model) {
    CasinoGame.hasMany(model.CasinoTransaction, {
      foreignKey: 'gameId'
    })
    CasinoGame.hasOne(model.FavouriteGame, {
      foreignKey: 'gameId'
    })
    CasinoGame.belongsTo(model.GameAggregator, {
      foreignKey: 'gameAggregatorId'
    })
    CasinoGame.belongsTo(model.GameProvider, {
      foreignKey: 'providerId'
    })
    CasinoGame.belongsTo(model.GameCategory, {
      foreignKey: 'gameCategoryId',
      as: 'gameCategory'
    })
  }

  return CasinoGame
}
