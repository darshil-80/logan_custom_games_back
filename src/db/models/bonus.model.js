export default (sequelize, DataTypes) => {
  const Bonus = sequelize.define('Bonus', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    actioneeId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    validFrom: {
      type: DataTypes.DATE,
      allowNull: true
    },
    validUpto: {
      type: DataTypes.DATE,
      allowNull: true
    },
    daysToClear: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    promotionTitle: {
      type: DataTypes.STRING,
      allowNull: true
    },
    termsAndConditions: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    bonusPercent: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    bonusType: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'welcome- welcome bonus freespins- spin bonus, deposit- deposit bonus'
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    freeSpinQuantity: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    maxFreeSpinBetAmount: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    maxFreeSpinWinAmount: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    currencyCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    wageringMultiplier: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    visibleInPromotions: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    minDeposit: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    joiningBonusAmount: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    maxDepositBonusAmount: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    claimedCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    referralBonusAmount: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    gameIds: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    splitDays: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    directCreditPercent: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    splitCreditPercent: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'bonus',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: 'bonus_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      }
    ]
  })

  Bonus.associate = models => {
    Bonus.hasOne(models.UserBonus, {
      foreignKey: 'bonusId',
      as: 'userBonus'
    })
  }
  return Bonus
}
