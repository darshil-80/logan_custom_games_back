export default (sequelize, DataTypes) => {
  const GameCategory = sequelize.define('GameCategory', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false
    },
    gameCategory: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    isVisible: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'game_category',
    schema: 'public',
    timestamps: true
  })

  GameCategory.associate = models => {
    GameCategory.hasMany(models.CasinoGame, {
      foreignKey: 'gameCategoryId',
      as: 'casinoGame'
    })
  }
  return GameCategory
}
