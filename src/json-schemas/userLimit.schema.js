import ajv from '../libs/ajv'

const UserLimit = {
  $id: '/UserLimit.json',
  type: 'object',
  properties: {
    getLimits: {
      type: 'object',
      properties: {
        limitId: { type: ['number', 'null'] },
        userId: { type: ['number', 'null'] },
        timeLimit: { type: ['string', 'null'] },
        timeLimitExpiry: { type: ['string', 'null'] },
        timeLimitUpdatedAt: { type: ['string', 'null'] },
        dailyBetLimit: { type: ['number', 'null'] },
        dailyBetExpiry: { type: ['string', 'null'] },
        dailyBetUpdatedAt: { type: ['string', 'null'] },
        weeklyBetLimit: { type: ['number', 'null'] },
        weeklyBetExpiry: { type: ['string', 'null'] },
        weeklyBetUpdatedAt: { type: ['string', 'null'] },
        monthlyBetLimit: { type: ['number', 'null'] },
        monthlyBetExpiry: { type: ['string', 'null'] },
        monthlyBetUpdatedAt: { type: ['string', 'null'] },
        dailyLossLimit: { type: ['number', 'null'] },
        dailyLossExpiry: { type: ['string', 'null'] },
        dailyLossUpdatedAt: { type: ['string', 'null'] },
        weeklyLossLimit: { type: ['number', 'null'] },
        weeklyLossExpiry: { type: ['string', 'null'] },
        weeklyLossUpdatedAt: { type: ['string', 'null'] },
        monthlyLossLimit: { type: ['number', 'null'] },
        monthlyLossExpiry: { type: ['string', 'null'] },
        monthlyLossUpdatedAt: { type: ['string', 'null'] },
        dailyDepositLimit: { type: ['number', 'null'] },
        dailyDepositExpiry: { type: ['string', 'null'] },
        dailyDepositUpdatedAt: { type: ['string', 'null'] },
        weeklyDepositLimit: { type: ['number', 'null'] },
        weeklyDepositExpiry: { type: ['string', 'null'] },
        weeklyDepositUpdatedAt: { type: ['string', 'null'] },
        monthlyDepositLimit: { type: ['number', 'null'] },
        monthlyDepositExpiry: { type: ['string', 'null'] },
        monthlyDepositUpdatedAt: { type: ['string', 'null'] },
        selfExclusion: { type: ['string', 'null'] },
        isSelfExclusionPermanent: { type: ['boolean', 'null'] },
        selfExclusionType: { type: ['string', 'null'] },
        selfExclusionUpdatedAt: { type: ['string', 'null'] },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        todayTotalBet: { type: ['number', 'null'] },
        weekTotalBet: { type: ['number', 'null'] },
        monthTotalBet: { type: ['number', 'null'] },
        todayTotalWin: { type: ['number', 'null'] },
        weekTotalWin: { type: ['number', 'null'] },
        monthTotalWin: { type: ['number', 'null'] },
        todayTotalLoss: { type: ['number', 'null'] },
        weekTotalLoss: { type: ['number', 'null'] },
        monthTotalLoss: { type: ['number', 'null'] },
        todayTotalDeposit: { type: ['number', 'null'] },
        weekTotalDeposit: { type: ['number', 'null'] },
        monthTotalDeposit: { type: ['number', 'null'] }
      }
    }
  }
}

ajv.addSchema(UserLimit)
