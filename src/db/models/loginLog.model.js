'use strict'

export default (sequelize, DataTypes) => {
  const LoginLog = sequelize.define('LoginLog', {
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
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    loginIp: {
      type: DataTypes.STRING,
      allowNull: true
    },
    appVersion: {
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
    },
    systemVersion: {
      type: DataTypes.STRING,
      allowNull: true
    },
    vipLevel: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'login_logs',
    schema: 'public',
    timestamps: true
  })

  LoginLog.associate = models => {
    LoginLog.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    })
  }

  return LoginLog
}
