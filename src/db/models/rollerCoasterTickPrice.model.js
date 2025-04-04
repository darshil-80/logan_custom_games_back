
export default (sequelize, DataTypes) => {
  const RollerCoasterGameTickPrice = sequelize.define('RollerCoasterGameTickPrice', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    roundId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    priceChange: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: true,
      defaultValue: 0.0
    },
    currentPrice: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: true,
      defaultValue: 0.0
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
    tableName: 'roller_coaster_game_tick_price',
    schema: 'public',
    timestamps: true
  })

  return RollerCoasterGameTickPrice
}
