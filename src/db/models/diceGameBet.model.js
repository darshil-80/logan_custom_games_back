import { DEFAULT_GAME_ID } from '../../libs/constants'

export default (sequelize, DataTypes) => {
  const DiceGameBet = sequelize.define('DiceGameBet', {
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
    number: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0.0,
      field: 'number'
    },
    winningNumber: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0.0,
      field: 'winning_number'
    },
    rollOver: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'roll_over'
    },
    betAmount: {
      allowNull: false,
      type: DataTypes.DECIMAL(20, 8)
    },
    winningAmount: {
      allowNull: true,
      type: DataTypes.DECIMAL
    },
    result: {
      allowNull: true,
      type: DataTypes.STRING
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
    tableName: 'dice_game_bets',
    timestamps: true,
    schema: 'public',
    indexes: [
      {
        name: 'dice_game_bets_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      },
      {
        name: 'index_dice_game_bets_on_currency_id',
        fields: [
          { name: 'currency_id' }
        ]
      },
      {
        name: 'index_dice_game_bets_on_user_id',
        fields: [
          { name: 'user_id' }
        ]
      }
    ]
  })

  DiceGameBet.associate = function (models) {
    DiceGameBet.belongsTo(models.User, { as: 'user', foreignKey: 'userId' })
    DiceGameBet.belongsTo(models.Currency, { as: 'currency', foreignKey: 'currencyId' })
    DiceGameBet.hasMany(models.Transaction, { foreignKey: 'betId', constraints: false, scope: { gameId: DEFAULT_GAME_ID.DICE } })
  }

  return DiceGameBet
}
