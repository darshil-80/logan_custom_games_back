'use strict'

export default (sequelize, DataTypes) => {
  const ReportedUser = sequelize.define('ReportedUser', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    actioneeId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    reportedUserId: {
      type: DataTypes.BIGINT,
      allowNull: false
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'reported_user',
    schema: 'public',
    timestamps: true
  })

  ReportedUser.associate = (models) => {
    ReportedUser.belongsTo(models.User, {
      foreignKey: 'reportedUserId',
      as: 'reportedUser'
    })

    ReportedUser.belongsTo(models.User, {
      foreignKey: 'actioneeId',
      as: 'victimUser'
    })
  }

  return ReportedUser
}
