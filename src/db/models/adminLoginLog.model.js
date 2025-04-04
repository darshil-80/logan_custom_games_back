'use strict'

export default (sequelize, DataTypes) => {
  const AdminLoginLog = sequelize.define('AdminLoginLog', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    loginTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    adminUserId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    loginIp: {
      type: DataTypes.STRING,
      allowNull: true
    },
    loginDeviceCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    device: {
      type: DataTypes.STRING,
      allowNull: true
    },
    deviceType: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'admin_login_logs',
    schema: 'public',
    timestamps: true
  })

  AdminLoginLog.associate = models => {
    AdminLoginLog.belongsTo(models.AdminUser, {
      foreignKey: 'adminUserId'
    })
  }

  return AdminLoginLog
}
