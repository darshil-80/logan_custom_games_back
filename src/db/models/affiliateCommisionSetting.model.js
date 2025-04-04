export default (sequelize, DataTypes) => {
  const AffiliateCommisionSetting = sequelize.define('AffiliateCommisionSetting', {
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
    profitCommisionPercentage: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    wageredCommisionPercentage: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'affiliate_commision_settings',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: 'index_affiliate_commision_settings_on_affiliate_id',
        fields: [
          { name: 'affiliate_id' }
        ]
      }
    ]
  })

  AffiliateCommisionSetting.associate = models => {
    AffiliateCommisionSetting.belongsTo(models.Affiliate, {
      foreignKey: 'affiliateId',
      onDelete: 'CASCADE',
      as: 'affiliates'
    })
  }

  return AffiliateCommisionSetting
}
