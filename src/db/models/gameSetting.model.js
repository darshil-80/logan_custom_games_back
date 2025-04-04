'use strict'

export default (sequelize, DataTypes) => {
  const GameSetting = sequelize.define('GameSetting', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    gameId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    minBet: {
      type: DataTypes.JSONB
    },
    maxBet: {
      type: DataTypes.JSONB
    },
    maxProfit: {
      type: DataTypes.JSONB
    },
    houseEdge: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    minOdds: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    maxOdds: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    minAutoRate: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    maxNumberOfAutoBets: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 10
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'game_settings',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: 'game_settings_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      }
    ]
  })
  GameSetting.associate = models => {
    GameSetting.belongsTo(models.Game, { foreignKey: 'gameId', as: 'gameDetails' })
  }

  return GameSetting
}
