'use strict'
export default (sequelize, DataTypes) => {
  const UserToken = sequelize.define('UserToken', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    token: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    tokenType: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'user_tokens',
    schema: 'public',
    timestamps: true,
    indexes: [{
      name: 'index_user_tokens_on_user_id',
      fields: [{
        name: 'user_id'
      }]
    }, {
      name: 'user_tokens_pkey',
      unique: true,
      fields: [{
        name: 'id'
      }]
    }
    ]
  })

  UserToken.associate = models => {
    UserToken.belongsTo(models.User, {
      foreignKey: 'userId'
    })
  }

  return UserToken
}
