import { DEFAULT_GAME_ID } from '../../libs/constants'

export default (sequelize, DataTypes) => {
  const CrashGameBet = sequelize.define('CrashGameBet', {
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
    autoRate: {
      allowNull: false,
      type: DataTypes.DECIMAL(20, 2)
    },
    escapeRate: {
      allowNull: true,
      defaultValue: 0,
      type: DataTypes.DECIMAL(20, 2)
    },
    betAmount: {
      allowNull: false,
      type: DataTypes.DECIMAL(20, 8)
    },
    winningAmount: {
      allowNull: true,
      type: DataTypes.DECIMAL
    },
    gameId: {
      allowNull: true,
      type: DataTypes.BIGINT
    },
    result: {
      allowNull: true,
      type: DataTypes.STRING
    },
    currencyId: {
      allowNull: false,
      type: DataTypes.BIGINT
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'crash_game_bets',
    timestamps: true,
    schema: 'public',
    indexes: [
      {
        name: 'crash_game_bets_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      },
      {
        name: 'index_crash_game_bets_on_currency_id',
        fields: [
          { name: 'currency_id' }
        ]
      },
      {
        name: 'index_crash_game_bets_on_user_id',
        fields: [
          { name: 'user_id' }
        ]
      }
    ]
  })

  CrashGameBet.associate = function (models) {
    CrashGameBet.belongsTo(models.CrashGameRoundDetail, { as: 'crashGameRoundDetail', foreignKey: 'roundId', targetKey: 'roundId' })
    CrashGameBet.belongsTo(models.User, { as: 'user', foreignKey: 'userId' })
    CrashGameBet.belongsTo(models.Currency, { as: 'currency', foreignKey: 'currencyId' })
    CrashGameBet.hasMany(models.Transaction, { as: 'transactions', foreignKey: 'betId', constraints: false, scope: { gameId: DEFAULT_GAME_ID.CRASH } })
  }

  return CrashGameBet
}
