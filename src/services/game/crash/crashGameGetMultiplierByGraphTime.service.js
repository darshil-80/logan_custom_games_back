import ServiceBase from '../../../libs/serviceBase'
import { DEFAULT_GAME_ID } from '../../../libs/constants'
/**
 *
 *
 * @export
 * @class CrashGameGetMultiplierByGraphTimeService
 * @extends {ServiceBase}
 */
export default class CrashGameGetMultiplierByGraphTimeService extends ServiceBase {
  async run () {
    const {
      dbModels: {
        GameSetting: GameSettingModel
      },
      sequelizeTransaction
    } = this.context

    const { minOdds: minOdd, maxOdds: maxOdd } = await GameSettingModel.findOne({
      where: {
        gameId: DEFAULT_GAME_ID.CRASH
      },
      transaction: sequelizeTransaction
    })

    const multiplier = +(Math.pow(2, this.args.time * 0.09)).toFixed(2)
    return +multiplier <= +minOdd ? +(minOdd.toFixed(2)) : multiplier >= maxOdd ? maxOdd : multiplier
  }
}
