'use strict'
export default (sequelize, DataTypes) => {
  const ChatRule = sequelize.define('ChatRule', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    rules: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    createdBy: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    updatedBy: {
      type: DataTypes.BIGINT,
      allowNull: false
    }

  }, {
    sequelize,
    underscored: true,
    tableName: 'chat_rules',
    schema: 'public',
    timestamps: true
  })

  ChatRule.associate = models => {
    ChatRule.belongsTo(models.AdminUser, {
      foreignKey: 'createdBy',
      as: 'adminUser'
    })

    ChatRule.belongsTo(models.AdminUser, {
      foreignKey: 'updatedBy',
      as: 'updatedByAdminUser'
    })
  }

  return ChatRule
}
