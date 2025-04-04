'use strict'

export default (sequelize, DataTypes) => {
  const UpliftingWord = sequelize.define('UpliftingWord', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    multipliers: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0.00
    },
    word: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'uplifting_word',
    schema: 'public',
    timestamps: true
  })

  return UpliftingWord
}
