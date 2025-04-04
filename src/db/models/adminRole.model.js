export default (sequelize, DataTypes) => {
  const AdminRole = sequelize.define('AdminRole', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    roleType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    operator: {
      type: DataTypes.STRING,
      allowNull: true
    },
    permission: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    resourceType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    resourceId: {
      type: DataTypes.BIGINT,
      allowNull: true
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'admin_roles',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: 'admin_roles_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      },
      {
        name: 'index_admin_roles_on_name_and_resource_type_and_resource_id',
        fields: [
          { name: 'name' },
          { name: 'resource_type' },
          { name: 'resource_id' }
        ]
      },
      {
        name: 'index_admin_roles_on_resource_type_and_resource_id',
        fields: [
          { name: 'resource_type' },
          { name: 'resource_id' }
        ]
      }
    ]
  })

  AdminRole.associate = models => {
    AdminRole.hasMany(models.AdminUser, {
      foreignKey: 'adminRoleId'
    })
    // Remove this if not needed
    AdminRole.belongsToMany(models.AdminUser, {
      through: models.AdminUsersAdminRole,
      foreignKey: 'adminRoleId'
    })
  }
  return AdminRole
}
