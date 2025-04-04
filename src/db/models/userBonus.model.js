import { WAGERING_STATUS } from '../../libs/constants'

export default (sequelize, DataTypes) => {
  const UserBonus = sequelize.define('UserBonus', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    bonusId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    bonusType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    freeSpinsQty: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    bonusAmount: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0.0
    },
    amountToWager: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    wageredAmount: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0.0
    },
    wageringStatus: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: WAGERING_STATUS.PENDING
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true
    },
    transactionId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    claimedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'date of issuing bonus to player, or when player claims any bonus'
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    readyToClaimAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    games: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    cashAmount: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    amountConverted: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0
    },
    cancelledBy: {
      type: DataTypes.STRING,
      allowNull: true
    },
    claimedCount: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 0
    },
    referredUserId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    splitBonusAmount: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    directBonusAmount: {
      type: DataTypes.DOUBLE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'user_bonus',
    underscored: true,
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: 'index_user_bonus_on_bonus_id',
        fields: [
          { name: 'bonus_id' }
        ]
      },
      {
        name: 'index_user_bonus_on_user_id',
        fields: [
          { name: 'user_id' }
        ]
      },
      {
        name: 'index_user_bonus_on_transaction_id',
        fields: [
          { name: 'transaction_id' }
        ]
      },
      {
        name: 'user_bonus_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      }
    ]
  })

  UserBonus.associate = models => {
    UserBonus.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    })
    UserBonus.belongsTo(models.User, {
      foreignKey: 'referredUserId',
      as: 'referredUser'
    })
    UserBonus.belongsTo(models.Bonus, {
      foreignKey: 'bonusId',
      as: 'bonus'
    })
  }

  return UserBonus
}
