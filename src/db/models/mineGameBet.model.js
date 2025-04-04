import { DEFAULT_GAME_ID } from '../../libs/constants'

export default (sequelize, DataTypes) => {
  const MineGameBet = sequelize.define('MineGameBet', {
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
    mineCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    mineTiles: {
      type: DataTypes.JSONB,
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
    tableName: 'mine_game_bets',
    timestamps: true,
    schema: 'public',
    indexes: [
      {
        name: 'mine_game_bets_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      },
      {
        name: 'index_mine_game_bets_on_currency_id',
        fields: [
          { name: 'currency_id' }
        ]
      },
      {
        name: 'index_mine_game_bets_on_user_id',
        fields: [
          { name: 'user_id' }
        ]
      }
    ]
  })

  MineGameBet.associate = function (models) {
    MineGameBet.belongsTo(models.User, { as: 'user', foreignKey: 'userId' })
    MineGameBet.belongsTo(models.Currency, { as: 'currency', foreignKey: 'currencyId' })
    MineGameBet.hasMany(models.Transaction, { foreignKey: 'betId', constraints: false, scope: { gameId: DEFAULT_GAME_ID.MINE } })
    MineGameBet.hasMany(models.MineGamePlayState, { as: 'playStates', foreignKey: 'betId' })
  }

  return MineGameBet
}
