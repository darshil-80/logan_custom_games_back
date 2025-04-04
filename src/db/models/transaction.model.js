'use strict'

import { DEFAULT_GAME_ID } from '../../libs/constants'

export default (sequelize, DataTypes) => {
  const Transaction = sequelize.define('Transaction', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    actioneeType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    actioneeId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    sourceWalletId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    targetWalletId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    amount: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0.0
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true
    },
    comments: {
      type: DataTypes.STRING,
      allowNull: true
    },
    transactionType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    gameId: {
      allowNull: true,
      type: DataTypes.BIGINT
    },
    betId: {
      allowNull: true,
      type: DataTypes.BIGINT
    },
    debitTransactionId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isNonCashAmount: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    coinPaymentTxnId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    transactionId: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'transactions',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: 'index_transactions_on_actionee_type_and_actionee_id',
        fields: [
          { name: 'actionee_type' },
          { name: 'actionee_id' }
        ]
      },
      {
        name: 'index_transactions_on_source_wallet_id',
        fields: [
          { name: 'source_wallet_id' }
        ]
      },
      {
        name: 'index_transactions_on_target_wallet_id',
        fields: [
          { name: 'target_wallet_id' }
        ]
      },
      {
        name: 'transactions_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      }
    ]
  })

  Transaction.associate = models => {
    Transaction.belongsTo(models.User, {
      foreignKey: 'actioneeId',
      as: 'user'
    })
    Transaction.belongsTo(models.Wallet, {
      foreignKey: 'sourceWalletId',
      as: 'sourceWallet'
    })
    Transaction.belongsTo(models.Wallet, {
      foreignKey: 'targetWalletId',
      as: 'targetWallet'
    })
    Transaction.belongsTo(models.CrashGameBet, {
      foreignKey: 'betId',
      as: 'bet',
      scope: {
        gameId: DEFAULT_GAME_ID.CRASH
      }
    })
    Transaction.belongsTo(models.FlipCoinGameBet, {
      foreignKey: 'betId',
      scope: {
        gameId: DEFAULT_GAME_ID.FLIP_COIN
      }
    })
    Transaction.belongsTo(models.Game, {
      foreignKey: 'gameId',
      as: 'game'
    })
    Transaction.belongsTo(models.CryptoFuturesBet, {
      foreignKey: 'betId',
      as: 'cryptoFuturesBet'
    })
    Transaction.belongsTo(models.RollerCoasterGameBet, {
      foreignKey: 'betId',
      as: 'rollerCoasterBet',
      scope: {
        gameId: DEFAULT_GAME_ID.ROLLER_COASTER
      }
    })
    Transaction.belongsTo(models.CryptoFuturesInstrument, {
      foreignKey: 'betId',
      through: models.CryptoFuturesBet,
      as: 'instrument'
    })
  }

  return Transaction
}
