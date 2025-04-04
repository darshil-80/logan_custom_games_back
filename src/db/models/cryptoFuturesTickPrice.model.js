export default (sequelize, DataTypes) => {
  const CryptoFuturesTickPrice = sequelize.define('CryptoFuturesTickPrice', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    cryptoFuturesInstrumentId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    underscored: true,
    schema: 'public',
    tableName: 'crypto_futures_tick_prices',
    timestamps: true
  })

  return CryptoFuturesTickPrice
}
