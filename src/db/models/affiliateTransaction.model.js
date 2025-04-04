export default (sequelize, DataTypes) => {
  const AffiliateTransaction = sequelize.define('AffiliateTransaction', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    affiliateId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'affiliates',
        key: 'id'
      }
    },
    transactionId: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false
    },
    profitCommisionAmount: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    wageredCommisionAmount: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    comments: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true
    },
    currentCommisionSetting: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    transactionDate: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'affiliate_transactions',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: 'index_affiliate_transactions_on_affiliate_id',
        fields: [
          { name: 'affiliate_id' }
        ]
      }
    ]
  })

  AffiliateTransaction.associate = models => {
    AffiliateTransaction.belongsTo(models.Affiliate, {
      foreignKey: 'affiliateId',
      onDelete: 'CASCADE',
      as: 'affiliates'
    })
  }

  return AffiliateTransaction
}
