export default (sequelize, DataTypes) => {
  const AutoWithdrawRequestSetting = sequelize.define('AutoWithdrawRequestSetting', {
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
    minWithdrawAmount: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    maxWithdrawAmount: {
      type: DataTypes.JSONB,
      allowNull: true
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'auto_withdraw_request_settings',
    schema: 'public',
    timestamps: true
  })

  return AutoWithdrawRequestSetting
}
