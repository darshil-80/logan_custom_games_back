'use strict'

export default (sequelize, DataTypes) => {
  const SportBettingTransaction = sequelize.define('SportBettingTransaction', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    actioneeId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    betbyPlayerId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    actioneeType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    gameId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    extraData: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    eventId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    transactionId: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4,
      allowNull: true
    },
    providerTransactionId: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false
    },
    betslipId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    actionType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    timestamp: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    crossRateEuro: {
      type: DataTypes.STRING,
      allowNull: true
    },
    amount: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0.0
    },
    transactionType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    currencyId: {
      allowNull: false,
      type: DataTypes.BIGINT
    },
    isNonCashAmount: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'sport_betting_transactions',
    schema: 'public',
    timestamps: true
  })

  SportBettingTransaction.associate = models => {
    SportBettingTransaction.belongsTo(models.User, {
      foreignKey: 'actioneeId',
      as: 'user'
    })
  }

  return SportBettingTransaction
}
