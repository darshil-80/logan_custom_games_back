'use strict'

export default (sequelize, DataTypes) => {
  const ThemeSetting = sequelize.define('ThemeSetting', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    primary: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    themeName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'theme_name'
    },
    backgroundColor: {
      type: DataTypes.STRING,
      allowNull: false
    },
    headerFont: {
      type: DataTypes.STRING,
      allowNull: false
    },
    headerFontColor: {
      type: DataTypes.STRING,
      allowNull: false
    },
    contentFont: {
      type: DataTypes.STRING,
      allowNull: false
    },
    contentFontColor: {
      type: DataTypes.STRING,
      allowNull: false
    },
    buttonFont: {
      type: DataTypes.STRING,
      allowNull: false
    },
    buttonFontColor: {
      type: DataTypes.STRING,
      allowNull: false
    },
    buttonBackgroundColor: {
      type: DataTypes.STRING,
      allowNull: false
    },
    buttonBackgroundHoverColor: {
      type: DataTypes.STRING,
      allowNull: false
    },
    borderColor: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'theme_setting',
    schema: 'public',
    timestamps: true
  })

  return ThemeSetting
}
