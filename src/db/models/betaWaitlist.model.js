'use strict'
export default (sequelize, DataTypes) => {
  const BetaWaitlist = sequelize.define('BetaWaitlist', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    telegram: {
      type: DataTypes.STRING,
      allowNull: true
    },
    twitter: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'beta_waitlist',
    schema: 'public',
    timestamps: true
  })

  return BetaWaitlist
}
