import crypto from 'crypto'

export default (sequelize, DataTypes) => {
  const RollerCoasterGameRoundDetail = sequelize.define('RollerCoasterGameRoundDetail', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    roundId: {
      type: DataTypes.UUID,
      allowNull: true,
      unique: true,
      defaultValue: DataTypes.UUIDV4
    },
    basePrice: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: true,
      defaultValue: 1000
    },
    roundState: {
      allowNull: false,
      type: DataTypes.STRING,
      comment: '0=Finished and 1=Started'
    },
    roundHash: {
      allowNull: false,
      type: DataTypes.STRING
    },
    roundSignature: {
      allowNull: false,
      type: DataTypes.STRING
    },
    currentGameSettings: {
      allowNull: false,
      type: DataTypes.STRING
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'roller_coaster_game_round_details',
    schema: 'public',
    timestamps: true
  })

  RollerCoasterGameRoundDetail.beforeValidate((round) => {
    round.roundSignature = crypto.createHash('SHA256').update(round.roundHash).digest('hex')
  })

  RollerCoasterGameRoundDetail.associate = function (models) {
    RollerCoasterGameRoundDetail.hasMany(models.RollerCoasterGameBet, { as: 'bets', foreignKey: 'roundId', sourceKey: 'roundId' })
    RollerCoasterGameRoundDetail.hasMany(models.RollerCoasterGameTickPrice, { as: 'tickers', foreignKey: 'roundId', sourceKey: 'roundId' })
  }

  return RollerCoasterGameRoundDetail
}
