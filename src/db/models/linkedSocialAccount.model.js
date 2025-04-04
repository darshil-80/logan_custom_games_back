'use strict'

export default (sequelize, DataTypes) => {
  const LinkedSocialAccount = sequelize.define('LinkedSocialAccount', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    socialAccount: {
      type: DataTypes.STRING,
      allowNull: true
    },
    actioneeId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'linked_social_accounts',
    schema: 'public',
    timestamps: true
  })

  LinkedSocialAccount.associate = models => {
    LinkedSocialAccount.belongsTo(models.User, {
      foreignKey: 'actioneeId',
      as: 'user'
    })
  }
  return LinkedSocialAccount
}
