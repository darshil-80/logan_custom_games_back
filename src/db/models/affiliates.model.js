import { AFFILIATE_STATUS } from '../../libs/constants'

export default (sequelize, DataTypes) => {
  const Affiliate = sequelize.define('Affiliate', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false
    },
    url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: AFFILIATE_STATUS.ACTIVE,
      allowNull: true
    },
    ownerType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ownerId: {
      type: DataTypes.BIGINT,
      allowNull: true
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'affiliates',
    schema: 'public',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        name: 'index_affiliates_on_owner_type_and_owner_id',
        fields: [
          { name: 'owner_type' },
          { name: 'owner_id' }
        ]
      }
    ]
  })
  Affiliate.associate = models => {
    Affiliate.hasOne(models.AffiliateStats, {
      foreignKey: 'affiliateId',
      onDelete: 'CASCADE',
      as: 'affiliateStats'
    })
    Affiliate.hasOne(models.AffiliateCommisionSetting, {
      foreignKey: 'affiliateId',
      onDelete: 'CASCADE',
      as: 'affiliateCommision'
    })
    Affiliate.hasMany(models.AffiliateTransaction, {
      foreignKey: 'affiliateId',
      onDelete: 'CASCADE',
      as: 'transactions'
    })
    Affiliate.hasMany(models.AffiliateSettlement, {
      foreignKey: 'affiliateId',
      onDelete: 'CASCADE',
      as: 'settlements'
    })
    Affiliate.hasMany(models.AffiliateSettingLog, {
      foreignKey: 'affiliateId',
      onDelete: 'CASCADE',
      as: 'logs'
    })
    Affiliate.hasMany(models.User, {
      foreignKey: 'affiliateId',
      onDelete: 'CASCADE',
      as: 'user'
    })
  }
  return Affiliate
}
