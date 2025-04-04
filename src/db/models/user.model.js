'use strict'

import { USER_TYPES } from '../../libs/constants'

export default (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    encryptedPassword: {
      type: DataTypes.STRING,
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    phoneCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    phoneVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    dateOfBirth: {
      type: DataTypes.DATE,
      allowNull: true
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: true
    },
    profileImageUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    locale: {
      type: DataTypes.STRING,
      allowNull: true
    },
    signInCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    signInIp: {
      type: DataTypes.STRING,
      allowNull: true
    },
    parentType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    parentId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    countryCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    },
    selfExclusion: {
      type: DataTypes.STRING,
      allowNull: true
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    vipLevel: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    nickName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    disabledAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    disabledByType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    disabledById: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    nonce: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ethereumAddress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    twoFactorSecretKey: {
      type: DataTypes.STRING,
      allowNull: true
    },
    twoFactorEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    referralCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    referrerCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    affiliatedBy: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true
    },
    userType: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: USER_TYPES.USER
    },
    blockChatTillDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isBlockChatPermanently: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    loginMethod: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userRole: {
      type: DataTypes.STRING,
      allowNull: true
    },
    referralLink: {
      type: DataTypes.STRING,
      allowNull: true
    },
    group: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    rankingLevel: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    address1: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    address2: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true
    },
    province: {
      type: DataTypes.STRING,
      allowNull: true
    },
    postalCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    applicantId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    sumsubKycStatus: {
      type: DataTypes.STRING,
      allowNull: true
    },
    kycVerificationLevel: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isPrivate: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    affiliateById: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    affiliateId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    isChatModerator: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    vaultId: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'users',
    schema: 'public',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        name: 'index_users_on_parent_type_and_parent_id',
        fields: [
          { name: 'parent_type' },
          { name: 'parent_id' }
        ]
      }, {
        name: 'index_users_on_disabled_by_type_and_disabled_by_id',
        fields: [
          { name: 'disabled_by_type' },
          { name: 'disabled_by_id' }
        ]
      }, {
        name: 'users_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      }
    ]
  })

  User.associate = models => {
    User.hasMany(models.UserToken, {
      foreignKey: 'userId',
      onDelete: 'cascade'
    })
    User.hasMany(models.Wallet, {
      foreignKey: 'ownerId',
      onDelete: 'cascade',
      scope: {
        ownerType: USER_TYPES.USER
      },
      as: 'wallets'
    })
    User.hasMany(models.Transaction, {
      foreignKey: 'actioneeId',
      onDelete: 'cascade',
      scope: {
        actioneeType: USER_TYPES.USER
      },
      as: 'transactions'
    })
    User.hasMany(models.CrashGameBet, {
      foreignKey: 'userId',
      onDelete: 'cascade',
      as: 'bet'
    })
    User.hasMany(models.LoginLog, {
      foreignKey: 'userId',
      onDelete: 'cascade'
    })
    User.hasMany(models.SportBettingTransaction, {
      foreignKey: 'actioneeId',
      onDelete: 'cascade',
      scope: {
        actioneeType: USER_TYPES.USER
      },
      as: 'sportBettingTransactions'
    })
    User.hasMany(models.CasinoTransaction, {
      foreignKey: 'actioneeId',
      onDelete: 'cascade',
      scope: {
        actioneeType: USER_TYPES.USER
      },
      as: 'casinoTransactions'
    })
    User.hasMany(models.FavouriteGame, {
      foreignKey: 'userId',
      onDelete: 'cascade'
    })
    User.hasMany(models.CustomFavouriteGame, {
      foreignKey: 'userId',
      onDelete: 'cascade'
    })
    User.hasMany(models.PaymentTransaction, {
      foreignKey: 'actioneeId',
      onDelete: 'cascade',
      scope: {
        actioneeType: USER_TYPES.USER
      },
      as: 'paymentTransactions'
    })
    User.hasMany(models.UserChat, {
      foreignKey: 'actioneeId',
      onDelete: 'cascade'
    })
    User.hasMany(models.UserComment, {
      foreignKey: 'userId',
      onDelete: 'cascade'
    })
    User.belongsTo(models.RankingLevel, {
      foreignKey: 'rankingLevel',
      as: 'userRank'
    })
    User.hasMany(models.LinkedSocialAccount, {
      foreignKey: 'actioneeId',
      onDelete: 'cascade',
      as: 'linkedAccounts'
    })
    User.hasMany(models.KycVerification, {
      foreignKey: 'userId',
      onDelete: 'cascade',
      as: 'kycVerification'
    })
    User.belongsTo(models.Affiliate, {
      foreignKey: 'affiliateId',
      as: 'affiliate'
    })
  }
  return User
}
