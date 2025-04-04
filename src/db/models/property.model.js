'use strict'

export default (sequelize, DataTypes) => {
  const Property = sequelize.define('Property', {
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    value: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Property',
    underscored: true,
    tableName: 'properties',
    schema: 'public'
  })

  return Property
}
