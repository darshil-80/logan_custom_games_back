'use strict'
export default (sequelize, DataTypes) => {
  const UserComment = sequelize.define('UserComment', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    commentType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    commentedBy: {
      type: DataTypes.STRING,
      allowNull: true
    },
    commentedById: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'user_comments',
    schema: 'public',
    timestamps: true
  })

  UserComment.associate = models => {
    UserComment.belongsTo(models.User, {
      foreignKey: 'userId'
    })
  }

  return UserComment
}
