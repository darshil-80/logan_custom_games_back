export default (sequelize, DataTypes) => {
  const MineGamePlayState = sequelize.define('MineGamePlayState', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    betId: {
      allowNull: false,
      type: DataTypes.BIGINT
    },
    tile: {
      type: DataTypes.BIGINT,
      allowNull: false
    }
  }, {
    sequelize,
    underscored: true,
    tableName: 'mine_game_play_state',
    timestamps: true,
    schema: 'public',
    indexes: [
      {
        name: 'mine_game_play_state_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      },
      {
        name: 'index_mine_game_play_state_on_bet_id_and_tile',
        fields: [
          { name: 'bet_id' },
          { name: 'tile' }
        ]
      }
    ]
  })

  MineGamePlayState.associate = function (models) {
    MineGamePlayState.belongsTo(models.MineGameBet, { as: 'mineGameBet', foreignKey: 'betId', sourceKey: 'id' })
  }

  return MineGamePlayState
}
