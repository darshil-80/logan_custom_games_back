import { DEFAULT_GAME_ID } from '../../libs/constants'

export default (sequelize, DataTypes) => {
  const PlinkoGameBet = sequelize.define('PlinkoGameBet', {
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
    numberOfRows: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    riskLevel: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: false,
      comment: '1=Low, 2=Medium and 3=High'
    },
    dropDetails: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ''
    },
    winningSlot: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '0 <= winningSlot <= numberOfRows'
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
    tableName: 'plinko_game_bets',
    timestamps: true,
    schema: 'public',
    indexes: [
      {
        name: 'plinko_game_bets_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      },
      {
        name: 'index_plinko_game_bets_on_currency_id',
        fields: [
          { name: 'currency_id' }
        ]
      },
      {
        name: 'index_plinko_game_bets_on_user_id',
        fields: [
          { name: 'user_id' }
        ]
      }
    ]
  })

  PlinkoGameBet.associate = function (models) {
    PlinkoGameBet.belongsTo(models.User, { as: 'user', foreignKey: 'userId' })
    PlinkoGameBet.belongsTo(models.Currency, { as: 'currency', foreignKey: 'currencyId' })
    PlinkoGameBet.hasMany(models.Transaction, { foreignKey: 'betId', constraints: false, scope: { gameId: DEFAULT_GAME_ID.PLINKO } })
  }

  return PlinkoGameBet
}
