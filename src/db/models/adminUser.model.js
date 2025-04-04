'use strict'
export default (sequelize, DataTypes) => {
  const AdminUser = sequelize.define('AdminUser', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    phoneVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    parentType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    parentId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ''
    },
    encryptedPassword: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ''
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    resetPasswordSentAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    rememberCreatedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    confirmationToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    adminRoleId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    confirmedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    confirmationSentAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    unconfirmedEmail: {
      type: DataTypes.STRING,
      allowNull: true
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    },
    token: {
      type: DataTypes.STRING,
      allowNull: true
    },
    twoFactorSecretKey: {
      type: DataTypes.STRING,
      allowNull: true
    },
    permission: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {}
    },
    twoFactorEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    loginTime: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'admin_users',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: 'admin_users_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      },
      {
        name: 'index_admin_users_on_confirmation_token',
        unique: true,
        fields: [
          { name: 'confirmation_token' }
        ]
      },
      {
        name: 'index_admin_users_on_email',
        unique: true,
        fields: [
          { name: 'email' }
        ]
      },
      {
        name: 'index_admin_users_on_parent_type_and_parent_id',
        fields: [
          { name: 'parent_type' },
          { name: 'parent_id' }
        ]
      },
      {
        name: 'index_admin_users_on_reset_password_token',
        unique: true,
        fields: [
          { name: 'reset_password_token' }
        ]
      }
    ]
  })

  AdminUser.associate = models => {
    AdminUser.belongsTo(models.AdminRole, {
      foreignKey: 'adminRoleId',
      as: 'role'
    })
    AdminUser.hasMany(models.AdminLoginLog, {
      foreignKey: 'adminUserId',
      onDelete: 'cascade'
    })
  }

  return AdminUser
}
