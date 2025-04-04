export default (sequelize, DataTypes) => {
  const AffiliateSettlement = sequelize.define('AffiliateSettlement', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    affiliateId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'affiliates',
        key: 'id'
      }
    },
    settlementId: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false
    },
    profitCommisionAmount: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    wageredCommisionAmount: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true
    },
    currentCommisionSetting: {
      type: DataTypes.JSONB,
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
    tableName: 'affiliate_settlements',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: 'index_affiliate_settlements_on_affiliate_id',
        fields: [
          { name: 'affiliate_id' }
        ]
      }
    ]
  })

  AffiliateSettlement.associate = models => {
    AffiliateSettlement.belongsTo(models.Affiliate, {
      foreignKey: 'affiliateId',
      onDelete: 'CASCADE',
      as: 'affiliates'
    })
  }

  return AffiliateSettlement
}
