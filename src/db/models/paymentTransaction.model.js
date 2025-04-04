'use strict'

import { USER_TYPES } from '../../libs/constants'

export default (sequelize, DataTypes) => {
  const PaymentTransaction = sequelize.define('PaymentTransaction', {
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
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: true
    },
    coinPaymentTxnId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    transactionId: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false
    },
    moreDetails: {
      type: DataTypes.JSONB,
      allowNull: true
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'payment_transactions',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: 'index_payment_transaction_on_actionee_id',
        fields: [
          { name: 'actionee_id' }
        ]
      },
      {
        name: 'index_payment_transaction_on_source_wallet_id',
        fields: [
          { name: 'source_wallet_id' }
        ]
      },
      {
        name: 'index_payment_transaction_on_target_wallet_id',
        fields: [
          { name: 'target_wallet_id' }
        ]
      }
    ]
  })

  PaymentTransaction.associate = models => {
    PaymentTransaction.belongsTo(models.User, {
      foreignKey: 'actioneeId',
      scope: {
        actioneeType: USER_TYPES.USER
      }
    })
    PaymentTransaction.belongsTo(models.Wallet, {
      foreignKey: 'sourceWalletId',
      as: 'sourceWallet'
    })
    PaymentTransaction.belongsTo(models.Wallet, {
      foreignKey: 'targetWalletId',
      as: 'targetWallet'
    })
    PaymentTransaction.belongsTo(models.User, {
      foreignKey: 'sourceWalletId',
      through: models.Wallet,
      as: 'source'
    })
  }

  return PaymentTransaction
}
