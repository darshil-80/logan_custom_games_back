export default (sequelize, DataTypes) => {
  const Cms = sequelize.define('Cms', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    cmsSection: {
      type: DataTypes.STRING,
      allowNull: true
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    }
  }, {
    sequelize,
    underscored: true,
    schema: 'public',
    tableName: 'cms',
    timestamps: true
  })

  return Cms
}
