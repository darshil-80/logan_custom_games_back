'use strict'

export default (sequelize, DataTypes) => {
  const KycVerification = sequelize.define('KycVerification', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    verificationLevel: {
      type: DataTypes.STRING,
      allowNull: true
    },
    kycStatus: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'For System Kyc Status 0- pending, 1-approved, 2-rejected, 3-cancelled, 4-reRequested'
    },
    sumsubApplicantId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    actionableId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    actionPerformedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'reason for rejection if rejected'
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'kyc_verification',
    schema: 'public',
    timestamps: true
  })

  KycVerification.associate = models => {
    KycVerification.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    })
  }

  return KycVerification
}
