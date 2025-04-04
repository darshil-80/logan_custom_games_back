export default (sequelize, DataTypes) => {
  const Asset = sequelize.define('Asset', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    mime: {
      type: DataTypes.STRING,
      allowNull: false
    },
    size: {
      type: DataTypes.STRING,
      allowNull: false
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    alt: {
      type: DataTypes.STRING,
      allowNull: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'assets',
    schema: 'public',
    timestamps: true
  })

  return Asset
}
