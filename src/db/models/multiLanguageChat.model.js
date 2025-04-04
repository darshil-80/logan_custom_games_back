'use strict'

export default (sequelize, DataTypes) => {
  const MultiLanguageChat = sequelize.define('MultiLanguageChat', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    language: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    languageLogo: {
      type: DataTypes.STRING,
      allowNull: true
    }

  }, {
    sequelize,
    underscored: true,
    tableName: 'multi_language_chat',
    schema: 'public',
    timestamps: true
  })

  return MultiLanguageChat
}
