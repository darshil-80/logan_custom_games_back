'use strict'

export default (sequelize, DataTypes) => {
  const GameThemeBackgroundSetting = sequelize.define('GameThemeBackgroundSetting', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    gameId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'games',
        key: 'id'
      }
    },
    backgroundImageUrl: {
      type: DataTypes.STRING,
      allowNull: false
    },
    backgroundAnimationFileUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    loadingBarImageUrl: {
      type: DataTypes.STRING,
      allowNull: false
    },
    loadingBarAnimationFileUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    graphColor: {
      type: DataTypes.STRING,
      allowNull: true
    },
    blastColor: {
      type: DataTypes.STRING,
      allowNull: true
    },
    axisColor: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isGraphEnable: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    gameLogoUrl: {
      type: DataTypes.STRING,
      allowNull: false
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'game_theme_background_settings',
    schema: 'public',
    timestamps: true
  })

  GameThemeBackgroundSetting.associate = (models) => {
    GameThemeBackgroundSetting.belongsTo(models.Game, {
      foreignKey: 'gameId',
      as: 'gameDetails'
    })
  }
  return GameThemeBackgroundSetting
}
