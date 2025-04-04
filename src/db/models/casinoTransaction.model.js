'use strict'

export default (sequelize, DataTypes) => {
  const CasinoTransaction = sequelize.define('CasinoTransaction', {
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
    transactionType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    transactionId: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false
    },
    casinoGameId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    actionType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    amount: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0.0
    },
    currencyId: {
      allowNull: false,
      type: DataTypes.BIGINT
    },
    currencyCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    transactionInfo: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    beforeBalance: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    afterBalance: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    nonCashAmount: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    isNonCashAmount: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'casino_transactions',
    schema: 'public',
    timestamps: true
  })

  CasinoTransaction.associate = models => {
    CasinoTransaction.belongsTo(models.User, {
      foreignKey: 'actioneeId',
      as: 'user'
    })
    CasinoTransaction.belongsTo(models.NuxGame, {
      foreignKey: 'gameId',
      as: 'game'
    })
    CasinoTransaction.belongsTo(models.CasinoGame, {
      foreignKey: 'gameId',
      targetKey: 'id',
      as: 'casino'
    })
  }

  return CasinoTransaction
}
