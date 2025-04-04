export default (sequelize, DataTypes) => {
  const AffiliateSettingLog = sequelize.define('AffiliateSettingLog', {
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
    commisionSettingLogs: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    transactionLogs: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    settlementLogs: {
      type: DataTypes.JSONB,
      allowNull: true
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'affiliate_setting_logs',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: 'index_affiliate_setting_logs_on_affiliate_id',
        fields: [
          { name: 'affiliate_id' }
        ]
      }
    ]
  })

  AffiliateSettingLog.associate = models => {
    AffiliateSettingLog.belongsTo(models.Affiliate, {
      foreignKey: 'affiliateId',
      onDelete: 'CASCADE',
      as: 'affiliates'
    })
  }

  return AffiliateSettingLog
}
