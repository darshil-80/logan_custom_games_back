import crypto from 'crypto'

export default (sequelize, DataTypes) => {
  const CrashGameRoundDetail = sequelize.define('CrashGameRoundDetail', {
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
    crashRate: {
      allowNull: true,
      type: DataTypes.DECIMAL(20, 2)
    },
    roundState: {
      allowNull: false,
      type: DataTypes.STRING,
      comment: '0=Finished and 1=Started and 2=OnHold and 3=GraphFinished'
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
    },
    onHoldAt: {
      allowNull: true,
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'crash_game_round_details',
    schema: 'public',
    timestamps: true
  })

  CrashGameRoundDetail.beforeValidate((round) => {
    round.roundSignature = crypto.createHash('md5').update(`${Number(round.crashRate).toFixed(2)}-${round.roundHash}`).digest('hex')
  })

  CrashGameRoundDetail.associate = function (models) {
    CrashGameRoundDetail.hasMany(models.CrashGameBet, { as: 'bets', foreignKey: 'roundId', sourceKey: 'roundId' })
  }

  return CrashGameRoundDetail
}
