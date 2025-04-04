'use strict'

export default (sequelize, DataTypes) => {
  const Announcement = sequelize.define('Announcement', {
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
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    isPinned: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    createdBy: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    updatedBy: {
      type: DataTypes.BIGINT,
      allowNull: false
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'announcements',
    schema: 'public',
    timestamps: true
  })

  return Announcement
}
