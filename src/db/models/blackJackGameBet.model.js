import { DEFAULT_GAME_ID } from '../../libs/constants'

export default (sequelize, DataTypes) => {
  const BlackJackGameBet = sequelize.define('BlackJackGameBet', {
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
    playerHand: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    dealerHand: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    playersPoint: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    dealersPoint: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    playersAcePoint: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    dealersAcePoint: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    betAmount: {
      allowNull: false,
      type: DataTypes.DECIMAL(20, 8)
    },
    winningAmount: {
      allowNull: true,
      type: DataTypes.DECIMAL
    },
    isDouble: {
      allowNull: false,
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isSplit: {
      allowNull: false,
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    result: {
      allowNull: true,
      type: DataTypes.STRING
    },
    gameResult: {
      allowNull: true,
      type: DataTypes.STRING
    },
    parentBetId: {
      allowNull: true,
      type: DataTypes.BIGINT
    },
    roundId: {
      allowNull: true,
      type: DataTypes.UUID
    },
    currencyId: {
      allowNull: false,
      type: DataTypes.BIGINT
    },
    currentGameSettings: {
      allowNull: false,
      type: DataTypes.STRING
    },
    clientSeed: {
      type: DataTypes.STRING,
      allowNull: false
    },
    serverSeed: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'blackjack_game_bets',
    timestamps: true,
    schema: 'public',
    indexes: [
      {
        name: 'blackjack_game_bets_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      },
      {
        name: 'index_blackjack_game_bets_on_currency_id',
        fields: [
          { name: 'currency_id' }
        ]
      },
      {
        name: 'index_blackjack_game_bets_on_user_id',
        fields: [
          { name: 'user_id' }
        ]
      }
    ]
  })

  BlackJackGameBet.associate = function (models) {
    BlackJackGameBet.belongsTo(models.User, { as: 'user', foreignKey: 'userId' })
    BlackJackGameBet.hasMany(models.BlackJackGameBet, { as: 'splitBets', foreignKey: 'parentBetId' })
    BlackJackGameBet.belongsTo(models.BlackJackGameBet, { as: 'mainBet', foreignKey: 'parentBetId' })
    BlackJackGameBet.belongsTo(models.Currency, { as: 'currency', foreignKey: 'currencyId' })
    BlackJackGameBet.hasMany(models.Transaction, { foreignKey: 'betId', constraints: false, scope: { gameId: DEFAULT_GAME_ID.BLACKJACK } })
  }

  return BlackJackGameBet
}
