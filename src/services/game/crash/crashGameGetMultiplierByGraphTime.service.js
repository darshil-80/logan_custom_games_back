import ServiceBase from '../../../libs/serviceBase'
/**
 *
 *
 * @export
 * @class CrashGameGetMultiplierByGraphTimeService
 * @extends {ServiceBase}
 */
export default class CrashGameGetMultiplierByGraphTimeService extends ServiceBase {
  async run () {
    const { minOdds: minOdd, maxOdds: maxOdd } = {
      id: 1,
      gameId: '1',
      minBet: [ { coinName: 'USD', amount: 1 } ],
      maxBet: [ { coinName: 'USD', amount: 20 } ],
      maxProfit: [ { coinName: 'USD', amount: 50 } ],
      houseEdge: 4,
      minOdds: 1,
      maxOdds: 20,
      minAutoRate: 1.01,
      maxNumberOfAutoBets: 50,
      createdAt: '2025-01-21T09:02:19.680Z',
      updatedAt: '2025-01-30T11:22:53.615Z',
      gameDetails: {
        id: '1',
        name: 'crash',
        status: true,
        createdAt: '2025-01-21T09:02:19.638Z',
        updatedAt: '2025-01-21T09:02:19.638Z'
      },
      minOdd: 1,
      maxOdd: 20
    }
    const multiplier = +(Math.pow(2, this.args.time * 0.09)).toFixed(2)
    return +multiplier <= +minOdd ? +(minOdd.toFixed(2)) : multiplier >= maxOdd ? maxOdd : multiplier
  }
}
