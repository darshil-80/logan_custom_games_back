import { DEFAULT_GAME_ID } from '../../libs/constants'

export default (sequelize, DataTypes) => {
  const HiLoGameBet = sequelize.define('HiLoGameBet', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    initialCard: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    betAmount: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0.0
    },
    winningAmount: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0.0
    },
    result: {
      type: DataTypes.STRING,
      allowNull: true
    },
    clientSeed: {
      type: DataTypes.STRING,
      allowNull: false
    },
    serverSeed: {
      type: DataTypes.STRING,
      allowNull: false
    },
    currencyId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'currencies',
        key: 'id'
      }
    },
    currentGameSettings: {
      allowNull: false,
      type: DataTypes.STRING
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'hi_lo_game_bets',
    timestamps: true,
    indexes: [
      {
        name: 'hi_lo_game_bets_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      },
      {
        name: 'index_hi_lo_game_bets_on_currency_id',
        fields: [
          { name: 'currency_id' }
        ]
      },
      {
        name: 'index_hi_lo_game_bets_on_user_id',
        fields: [
          { name: 'user_id' }
        ]
      }
    ]
  })

  HiLoGameBet.associate = function (models) {
    HiLoGameBet.belongsTo(models.User, { as: 'user', foreignKey: 'userId' })
    HiLoGameBet.belongsTo(models.Currency, { as: 'currency', foreignKey: 'currencyId' })
    HiLoGameBet.hasMany(models.HiLoGameBetState, { as: 'betStates', foreignKey: 'betId' })
    HiLoGameBet.hasMany(models.Transaction, { foreignKey: 'betId', constraints: false, scope: { gameId: DEFAULT_GAME_ID.HILO } })
  }

  return HiLoGameBet
}
