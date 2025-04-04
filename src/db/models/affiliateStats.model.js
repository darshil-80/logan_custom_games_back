export default (sequelize, DataTypes) => {
  const AffiliateStats = sequelize.define('AffiliateStats', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    affiliateId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'affiliates',
        key: 'id'
      }
    },
    totalClicks: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'affiliate_stats',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: 'index_affiliate_stats_on_affiliate_id',
        fields: [
          { name: 'affiliate_id' }
        ]
      }
    ]
  })

  AffiliateStats.associate = models => {
    AffiliateStats.belongsTo(models.Affiliate, {
      foreignKey: 'affiliateId',
      onDelete: 'CASCADE',
      as: 'affiliates'
    })
  }

  return AffiliateStats
}
