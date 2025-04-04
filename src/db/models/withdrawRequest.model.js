export default (sequelize, DataTypes) => {
  const WithdrawRequest = sequelize.define('WithdrawRequest', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'pending'
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    accountNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    accountType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    amount: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    transactionId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    actionableType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    actionableId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    actionedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    walletId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    withdrawalAddress: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'withdraw_requests',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: 'index_withdraw_requests_on_actionable_type_and_actionable_id',
        fields: [
          { name: 'actionable_type' },
          { name: 'actionable_id' }
        ]
      },
      {
        name: 'index_withdraw_requests_on_user_id',
        fields: [
          { name: 'user_id' }
        ]
      },
      {
        name: 'index_withdraw_requests_on_wallet_id',
        fields: [
          { name: 'wallet_id' }
        ]
      },
      {
        name: 'withdraw_requests_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      }
    ]
  })

  WithdrawRequest.associate = (models) => {
    WithdrawRequest.belongsTo(models.Wallet, {
      foreignKey: 'walletId',
      as: 'walletDetails'
    })
    WithdrawRequest.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    })
  }

  return WithdrawRequest
}
