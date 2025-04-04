'use strict'
export default (sequelize, DataTypes) => {
  const Currency = sequelize.define('Currency', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    code: {
      type: DataTypes.STRING,
      allowNull: true
    },
    primary: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    exchangeRate: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    isFiat: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    units: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    symbol: {
      type: DataTypes.STRING,
      allowNull: true
    },
    verificationBaseUrl: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'currencies',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: 'currencies_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      }
    ]
  })

  return Currency
}
