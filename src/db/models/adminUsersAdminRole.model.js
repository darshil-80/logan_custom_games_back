export default (sequelize, DataTypes) => {
  const AdminUsersAdminRole = sequelize.define('AdminUsersAdminRole', {
    adminUserId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    adminRoleId: {
      type: DataTypes.BIGINT,
      allowNull: true
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'admin_users_admin_roles',
    schema: 'public',
    indexes: [
      {
        name: 'index_admin_users_admin_roles_on_admin_role_id',
        fields: [
          { name: 'admin_role_id' }
        ]
      },
      {
        name: 'index_admin_users_admin_roles_on_admin_user_id',
        fields: [
          { name: 'admin_user_id' }
        ]
      },
      {
        name: 'index_admin_users_roles_on_admin_users_roles',
        fields: [
          { name: 'admin_user_id' },
          { name: 'admin_role_id' }
        ]
      }
    ]
  })

  return AdminUsersAdminRole
}
