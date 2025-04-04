'use strict'

export default (sequelize, DataTypes) => {
  const OffensiveWord = sequelize.define('OffensiveWord', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    word: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'offensive_words',
    schema: 'public',
    timestamps: true
  })

  return OffensiveWord
}
