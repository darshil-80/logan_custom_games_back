'use strict'
export default (sequelize, DataTypes) => {
  const UserDocument = sequelize.define('UserDocument', {
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
    documentUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    documentName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'user_documents',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: 'index_user_documents_on_user_id',
        fields: [
          { name: 'user_id' }
        ]
      },
      {
        name: 'user_documents_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      }
    ]
  })

  UserDocument.associate = models => {
    UserDocument.belongsTo(models.User, {
      foreignKey: 'userId'
    })
  }

  return UserDocument
}
