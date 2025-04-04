import { DEFAULT_GAME_ID } from '../../libs/constants'

export default (sequelize, DataTypes) => {
  const RollerCoasterGameBet = sequelize.define('RollerCoasterGameBet', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    userId: {
      allowNull: false,
      type: DataTypes.BIGINT
    },
    roundId: {
      allowNull: false,
      type: DataTypes.STRING
    },
    multiplier: {
      allowNull: false,
      type: DataTypes.DECIMAL(20, 8)
    },
    isBuy: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      comment: '0=buy, 1=sell'
    },
    betAmount: {
      allowNull: false,
      type: DataTypes.DECIMAL(20, 8)
    },
    entryPrice: {
      allowNull: false,
      type: DataTypes.DECIMAL(20, 8)
    },
    exitPrice: {
      allowNull: true,
      type: DataTypes.DECIMAL(20, 8)
    },
    bustPrice: {
      allowNull: false,
      type: DataTypes.DECIMAL(20, 8)
    },
    takeProfitPrice: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: true,
      defaultValue: 0.0
    },
    stopLossPrice: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: true,
      defaultValue: 0.0
    },
    winningAmount: {
      allowNull: true,
      type: DataTypes.DECIMAL(20, 8)
    },
    result: {
      allowNull: true,
      type: DataTypes.STRING
    },
    currencyId: {
      allowNull: false,
      type: DataTypes.BIGINT
    },
    betStatus: {
      allowNull: true,
      type: DataTypes.STRING
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'roller_coaster_game_bets',
    timestamps: true,
    schema: 'public',
    indexes: [
      {
        name: 'roller_coaster_game_bets_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      },
      {
        name: 'index_roller_coaster_game_bets_on_currency_id',
        fields: [
          { name: 'currency_id' }
        ]
      },
      {
        name: 'index_roller_coaster_game_bets_on_user_id',
        fields: [
          { name: 'user_id' }
        ]
      }
    ]
  })

  RollerCoasterGameBet.associate = function (models) {
    RollerCoasterGameBet.belongsTo(models.RollerCoasterGameRoundDetail, { as: 'rollerCoasterGameRoundDetail', foreignKey: 'roundId', targetKey: 'roundId' })
    RollerCoasterGameBet.belongsTo(models.User, { as: 'user', foreignKey: 'userId' })
    RollerCoasterGameBet.belongsTo(models.Currency, { as: 'currency', foreignKey: 'currencyId' })
    RollerCoasterGameBet.hasMany(models.Transaction, { as: 'transactions', foreignKey: 'betId', constraints: false, scope: { game_id: DEFAULT_GAME_ID.ROLLER_COASTER } })
  }

  return RollerCoasterGameBet
}
