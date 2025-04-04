
export default (sequelize, DataTypes) => {
  const CryptoFuturesBet = sequelize.define('CryptoFuturesBet', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    isBuy: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    multiplier: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    entryPrice: {
      allowNull: false,
      type: DataTypes.DECIMAL(20, 8),
      defaultValue: 0.0
    },
    exitPrice: {
      allowNull: true,
      type: DataTypes.DECIMAL(20, 8),
      defaultValue: 0.0
    },
    bustPrice: {
      allowNull: false,
      type: DataTypes.DECIMAL(20, 8),
      defaultValue: 0.0
    },
    betAmount: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: true,
      defaultValue: 0.0
    },
    winningAmount: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: true,
      defaultValue: 0.0
    },
    takeProfitPrice: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: true,
      defaultValue: 0.0
    },
    stopLossPrice: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: true,
      defaultValue: 0.0
    },
    result: {
      type: DataTypes.STRING,
      allowNull: true
    },
    betStatus: {
      type: DataTypes.STRING,
      allowNull: true
    },
    cryptoFuturesInstrumentId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    feeType: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    underscored: true,
    schema: 'public',
    tableName: 'crypto_futures_bets',
    timestamps: true
  })

  CryptoFuturesBet.associate = function (models) {
    CryptoFuturesBet.belongsTo(models.User, {
      as: 'user', foreignKey: 'userId'
    })
    CryptoFuturesBet.belongsTo(models.CryptoFuturesInstrument, {
      foreignKey: 'cryptoFuturesInstrumentId',
      as: 'instrument'
    })
    CryptoFuturesBet.hasMany(models.Transaction, {
      foreignKey: 'betId',
      as: 'transactions'
    })
  }
  return CryptoFuturesBet
}
