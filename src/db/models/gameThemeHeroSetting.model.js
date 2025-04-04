'use strict'

export default (sequelize, DataTypes) => {
  const GameThemeHeroSetting = sequelize.define('GameThemeHeroSetting', {
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
    heroImageUrl: {
      type: DataTypes.STRING,
      allowNull: false
    },
    heroAnimationFileUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    heroBlastImageUrl: {
      type: DataTypes.STRING,
      allowNull: false
    },
    heroBlastAnimationFileUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    heroLoadingImageUrl: {
      type: DataTypes.STRING,
      allowNull: false
    },
    heroLoadingAnimationFileUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    heroFlyingImageUrl: {
      type: DataTypes.STRING,
      allowNull: false
    },
    heroFlyingAnimationFileUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'game_theme_hero_settings',
    schema: 'public',
    timestamps: true
  })

  GameThemeHeroSetting.associate = (models) => {
    GameThemeHeroSetting.belongsTo(models.Game, {
      foreignKey: 'gameId',
      as: 'gameDetails'
    })
  }
  return GameThemeHeroSetting
}
