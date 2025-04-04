import ajv from '../libs/ajv'

const user = {
  $id: '/user.json',
  type: 'object',
  properties: {
    id: { type: 'string' },
    firstName: { type: ['string', 'null'] },
    lastName: { type: ['string', 'null'] },
    email: { type: ['string', 'null'] },
    emailVerified: { type: 'boolean' },
    phone: { type: ['string', 'null'] },
    phoneCode: { type: ['string', 'null'] },
    phoneVerified: { type: 'boolean' },
    dateOfBirth: { type: ['string', 'null'] },
    gender: { type: ['string', 'null'] },
    locale: { type: ['string', 'null'] },
    signInCount: { type: 'number' },
    // TODO: It shoud be ipv4
    signInIp: { type: ['string', 'null'] },
    parentType: { type: ['string', 'null'] },
    parentId: { type: ['number', 'null'] },
    userName: { type: ['string', 'null'] },
    countryCode: { type: ['string', 'null'] },
    active: { type: 'boolean' },
    selfExclusion: { type: ['string', 'null'] },
    deletedAt: { type: ['string', 'null'], format: 'date-time' },
    vipLevel: { type: 'number' },
    nickName: { type: ['string', 'null'] },
    disabledAt: { type: ['string', 'null'], format: 'date-time' },
    disabledByType: { type: ['string', 'null'] },
    disabledById: { type: ['number', 'null'] },
    profilePicture: { type: 'string' },
    expireIn: { type: 'string', format: 'date-time' },
    nonce: { type: ['string', 'null'] },
    ethereumAddress: { type: ['string', 'null'] },
    twoFactorSecretKey: { type: ['string', 'null'] },
    twoFactorEnabled: { type: 'boolean' },
    referralCode: { type: ['string', 'null'] },
    applicantId: { type: ['string', 'null'] },
    sumsubKycStatus: { type: ['string', 'null'] },
    kycVerificationLevel: { type: ['string', 'null'] },
    referrerCode: { type: ['string', 'null'] },
    referralLink: { type: ['string', 'null'] },
    profileImageUrl: { type: ['string', 'null'] },
    isPrivate: { type: 'boolean' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    lastLogin: { type: ['string', 'null'], format: 'date-time' },
    loginMethod: { type: ['string', 'null'] },
    rankingLevel: { type: ['string', 'null'] },
    affiliateById: { type: ['string', 'null'] },
    affiliateId: { type: ['string', 'null'] },
    isChatModerator: { type: 'boolean' },
    wallets: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { $ref: '/wallet.json#/properties/id' },
          amount: { $ref: '/wallet.json#/properties/amount' },
          primary: { $ref: '/wallet.json#/properties/primary' },
          currencyId: { $ref: '/wallet.json#/properties/currencyId' },
          ownerType: { $ref: '/wallet.json#/properties/ownerType' },
          ownerId: { $ref: '/wallet.json#/properties/ownerId' },
          nonCashAmount: { $ref: '/wallet.json#/properties/nonCashAmount' },
          bonusBalance: { $ref: '/wallet.json#/properties/bonusBalance' },
          walletAddress: {
            $ref: '/wallet.json#/properties/walletAddress'
          },
          createdAt: { $ref: '/wallet.json#/properties/createdAt' },
          updatedAt: { $ref: '/wallet.json#/properties/updatedAt' },
          currency: {
            type: 'object',
            properties: {
              id: { $ref: '/currency.json#/properties/id' },
              name: { $ref: '/currency.json#/properties/name' },
              code: { $ref: '/currency.json#/properties/code' },
              primary: { $ref: '/currency.json#/properties/primary' },
              exchangeRate: {
                $ref: '/currency.json#/properties/exchangeRate'
              },
              isFiat: { $ref: '/currency.json#/properties/isFiat' },
              image: { $ref: '/currency.json#/properties/image' },
              units: { $ref: '/currency.json#/properties/units' },
              symbol: { $ref: '/currency.json#/properties/symbol' },
              createdAt: { $ref: '/currency.json#/properties/createdAt' },
              updatedAt: { $ref: '/currency.json#/properties/updatedAt' }
            }
          }
        }
      }
    },
    userRank: {
      type: ['object', 'null'],
      properties: {
        id: { $ref: '/rankingLevel.json#/properties/id' },
        rank: { $ref: '/rankingLevel.json#/properties/rank' },
        wagerRequirement: { $ref: '/rankingLevel.json#/properties/wagerRequirement' },
        status: { $ref: '/rankingLevel.json#/properties/status' },
        description: { type: ['string', 'null'] },
        imageLogo: { type: ['string', 'null'] },
        moreDetails: { type: ['object', 'null'] },
        createdAt: { $ref: '/rankingLevel.json#/properties/createdAt' },
        updatedAt: { $ref: '/rankingLevel.json#/properties/updatedAt' }
      }
    },
    nextRankingLevels: {
      type: 'array',
      items: {
        default: {
          $ref: '/user.json#/properties/userRank'
        }
      }
    },
    linkedAccounts: {
      type: ['array', 'null'],
      items: {
        type: 'object',
        properties: {
          id: { $ref: '/socialAccount.json#/properties/id' },
          socialAccount: { $ref: '/socialAccount.json#/properties/socialAccount' },
          username: { $ref: '/socialAccount.json#/properties/username' },
          status: { $ref: '/socialAccount.json#/properties/status' },
          actioneeId: { $ref: '/socialAccount.json#/properties/actioneeId' },
          createdAt: { $ref: '/socialAccount.json#/properties/createdAt' },
          updatedAt: { $ref: '/socialAccount.json#/properties/updatedAt' }
        }
      }
    },
    kycVerification: {
      type: ['array', 'null'],
      items: {
        type: 'object',
        properties: {
          id: { $ref: '/affiliate.json#/properties/id' },
          userId: { $ref: '/kycVerification.json#/properties/userId' },
          verificationLevel: { $ref: '/kycVerification.json#/properties/verificationLevel' },
          kycStatus: { $ref: '/kycVerification.json#/properties/kycStatus' },
          sumsubApplicantId: { $ref: '/kycVerification.json#/properties/sumsubApplicantId' },
          actionPerformedAt: { $ref: '/kycVerification.json#/properties/actionPerformedAt' },
          reason: { $ref: '/kycVerification.json#/properties/reason' },
          createdAt: { $ref: '/kycVerification.json#/properties/createdAt' },
          updatedAt: { $ref: '/kycVerification.json#/properties/updatedAt' }
        }
      }
    },
    affiliate: {
      type: ['object', 'null'],
      properties: {
        id: { $ref: '/affiliate.json#/properties/id' },
        code: { $ref: '/affiliate.json#/properties/code' },
        ownerId: { $ref: '/affiliate.json#/properties/ownerId' },
        status: { $ref: '/affiliate.json#/properties/status' },
        ownerType: { $ref: '/affiliate.json#/properties/ownerType' },
        url: { $ref: '/affiliate.json#/properties/url' },
        createdAt: { $ref: '/affiliate.json#/properties/createdAt' },
        deletedAt: { $ref: '/affiliate.json#/properties/deletedAt' },
        updatedAt: { $ref: '/affiliate.json#/properties/updatedAt' }
      }
    }
  }
}

ajv.addSchema(user)
