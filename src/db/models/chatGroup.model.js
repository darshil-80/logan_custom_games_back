'use strict'

export default (sequelize, DataTypes) => {
  const ChatGroup = sequelize.define('ChatGroup', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    groupLogo: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'chat_group',
    schema: 'public',
    timestamps: true
  })

  ChatGroup.associate = models => {
    ChatGroup.hasOne(models.UserChat, {
      foreignKey: 'groupId'
    })
  }

  return ChatGroup
}
