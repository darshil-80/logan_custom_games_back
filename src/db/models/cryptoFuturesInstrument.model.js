export default (sequelize, DataTypes) => {
  const CryptoFuturesInstrument = sequelize.define('CryptoFuturesInstrument', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    symbol: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    maxMultiplier: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    bustBuffer: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    bufferMultiplier: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    maxUserPosition: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    iconUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    positionMultiplier: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    isEnabled: {
      type: DataTypes.BOOLEAN,
      default: true
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
    tableName: 'crypto_futures_instruments',
    timestamps: true
  })
  CryptoFuturesInstrument.associate = function (models) {
    CryptoFuturesInstrument.hasMany(models.CryptoFuturesBet, {
      foreignKey: 'cryptoFuturesInstrumentId',
      as: 'cryptoFuturesBet'
    })
  }
  return CryptoFuturesInstrument
}
