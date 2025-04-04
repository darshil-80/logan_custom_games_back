import { DEFAULT_GAME_ID } from '../../libs/constants'

export default (sequelize, DataTypes) => {
  const FlipCoinGameBet = sequelize.define('FlipCoinGameBet', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    userId: {
      allowNull: false,
      type: DataTypes.BIGINT,
      field: 'user_id'
    },
    heads: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'heads'
    },
    numberOfCoins: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: 0,
      field: 'number_of_coins'
    },
    minimumChosenOutcome: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: 0,
      field: 'minimum_chosen_outcome'
    },
    outcome: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'outcome'
    },
    betAmount: {
      allowNull: false,
      type: DataTypes.DOUBLE,
      field: 'bet_amount'
    },
    winningAmount: {
      allowNull: true,
      type: DataTypes.DOUBLE,
      field: 'winning_amount'
    },
    result: {
      allowNull: true,
      type: DataTypes.STRING
    },
    currencyId: {
      allowNull: false,
      type: DataTypes.BIGINT
    },
    clientSeed: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'client_seed'
    },
    serverSeed: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'server_seed'
    },
    currentGameSettings: {
      allowNull: false,
      type: DataTypes.STRING
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'flip_coin_game_bets',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: 'flip_coin_game_bets_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      },
      {
        name: 'index_flip_coin_game_bets_on_currency_id',
        fields: [
          { name: 'currency_id' }
        ]
      },
      {
        name: 'index_flip_coin_game_bets_on_user_id',
        fields: [
          { name: 'user_id' }
        ]
      }
    ]
  })

  FlipCoinGameBet.associate = function (models) {
    FlipCoinGameBet.belongsTo(models.User, { as: 'user', foreignKey: 'userId' })
    FlipCoinGameBet.belongsTo(models.Currency, { as: 'currency', foreignKey: 'currencyId' })
    FlipCoinGameBet.hasMany(models.Transaction, { foreignKey: 'betId', constraints: false, scope: { gameId: DEFAULT_GAME_ID.FLIP_COIN } })
  }

  return FlipCoinGameBet
}
