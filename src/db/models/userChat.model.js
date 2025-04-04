'use strict'

export default (sequelize, DataTypes) => {
  const UserChat = sequelize.define('UserChat', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    actioneeId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    recipientId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    actioneeType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: '1-Active, 2-Edited, 3-Deleted'
    },
    isContainOffensiveWord: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    containTip: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    isPrivate: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'is_private'
    },
    roomLanguageId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    groupId: {
      type: DataTypes.BIGINT,
      allowed: true
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'user_chat',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: 'index_user_chat_on_message',
        fields: [
          { name: 'message' }
        ]
      },
      {
        name: 'index_user_chat_on_is_contain_offensive_word',
        fields: [
          { name: 'is_contain_offensive_word' }
        ]
      },
      {
        name: 'index_user_chat_on_room_language_id',
        fields: [
          { name: 'room_language_id' }
        ]
      },
      {
        name: 'index_user_chat_on_group_id',
        fields: [
          { name: 'group_id' }
        ]
      }
    ]
  })

  UserChat.associate = models => {
    UserChat.belongsTo(models.User, {
      foreignKey: 'actioneeId',
      as: 'user'
    })

    UserChat.belongsTo(models.User, {
      foreignKey: 'recipientId',
      as: 'recipientUser'
    })
  }

  return UserChat
}
