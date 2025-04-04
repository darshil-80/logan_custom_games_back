
export default (sequelize, DataTypes) => {
  const HiLoGameBetState = sequelize.define('HiLoGameBetState', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    betId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'hi_lo_game_bets',
        key: 'id'
      }
    },
    betType: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: '1=Same Or Above and 2=Same and 3=Same OR Below 4=above 5=below'
    },
    openedCard: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    coefficient: {
      type: DataTypes.DOUBLE,
      allowNull: true
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'hi_lo_game_bet_states',
    timestamps: true
  })

  HiLoGameBetState.associate = function (models) {
    HiLoGameBetState.belongsTo(models.HiLoGameBet, { as: 'bet', foreignKey: 'betId', sourceKey: 'id' })
  }

  return HiLoGameBetState
}
