'use strict'

import { USER_TYPES } from '../../libs/constants'

export default (sequelize, DataTypes) => {
  const Wallet = sequelize.define('Wallet', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    amount: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0.0
    },
    primary: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    currencyId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    ownerType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ownerId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    nonCashAmount: {
      type: DataTypes.DOUBLE,
      defaultValue: 0.0
    },
    bonusBalance: {
      type: DataTypes.DOUBLE,
      defaultValue: 0.0
    },
    walletAddress: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'wallets',
    schema: 'public',
    timestamps: true,
    indexes: [{
      name: 'index_wallets_on_currency_id',
      fields: [{
        name: 'currency_id'
      }]
    }, {
      name: 'index_wallets_on_owner_type_and_owner_id',
      fields: [{
        name: 'owner_type'
      }, {
        name: 'owner_id'
      }]
    }, {
      name: 'wallets_pkey',
      unique: true,
      fields: [{
        name: 'id'
      }]
    }
    ]
  })

  Wallet.associate = (models) => {
    Wallet.belongsTo(models.User, {
      foreignKey: 'ownerId',
      as: 'user',
      scope: {
        userType: USER_TYPES.USER
      }
    })
    Wallet.belongsTo(models.AdminUser, {
      foreignKey: 'ownerId',
      scope: {
        ownerType: USER_TYPES.ADMIN
      }
    })
    Wallet.belongsTo(models.Currency, {
      foreignKey: 'currencyId',
      as: 'currency'
    })
    Wallet.hasMany(models.Transaction, {
      foreignKey: 'sourceWalletId',
      onDelete: 'cascade'
    })
    Wallet.hasMany(models.Transaction, {
      foreignKey: 'targetWalletId',
      onDelete: 'cascade'
    })
  }

  return Wallet
}
