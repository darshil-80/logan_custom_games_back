import ServiceBase from '../../libs/serviceBase'
import ajv from '../../libs/ajv'
// import { MIN_WAGER_AMOUNT_FOR_CHAT, MAX_CHAT_CHARACTERS, TRANSACTION_TYPES, TRANSACTION_STATUS } from '../../libs/constants'
import { MAX_CHAT_CHARACTERS, DELETED_MESSAGE, URL_CHAT_MESSAGE } from '../../libs/constants'
import LiveChatsEmitter from '../../socket-resources/emitters/chat.emitter'
import { isDateInFuture } from '../../utils/date.utils'
import containsLink, { isContainOffensiveWord } from '../../utils/chat.utils'
import { Sequelize } from '../../db/models'

const schema = {
  type: 'object',
  properties: {
    userName: { type: 'string' },
    message: { type: 'string' },
    amount: { type: 'number' },
    receiverId: { type: 'string' },
    receiverName: { type: 'string' },
    isPrivate: { type: 'boolean' },
    languageId: { type: 'number' },
    groupId: { type: 'string' }
  },
  required: ['message']
}

const constraints = ajv.compile(schema)

/**
 * it provides service of chatting for a user
 * @export
 * @class Chat service
 * @extends {ServiceBase}
 */
export default class UserChatService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const { userName, message, amount, receiverId, receiverName, isPrivate, languageId, groupId } = this.args
    const {
      dbModels: {
        // PaymentTransaction: PaymentTransactionModel,
        User: UserModel,
        UserChat: UserChatModel,
        RankingLevel: RankingLevelModel,
        OffensiveWord: OffensiveWordModel,
        LinkedSocialAccount: LinkedSocialAccountModel

      },
      auth: { id: userId },
      sequelizeTransaction
    } = this.context

    // const userWagerAmount = await PaymentTransactionModel.sum('amount', {
    //   where: {
    //     actioneeId: userId,
    //     transactionType: TRANSACTION_TYPES.DEPOSIT,
    //     status: TRANSACTION_STATUS.SUCCESS
    //   }
    // }, { transaction: sequelizeTransaction })

    const userDetails = await UserModel.findOne({
      attributes: ['isBlockChatPermanently', 'blockChatTillDate', 'profileImageUrl', [Sequelize.literal('"userRank"."more_details"'), 'moreDetails'], 'isChatModerator'],
      where: {
        id: userId
      },
      include: [{
        model: RankingLevelModel,
        attributes: [],
        as: 'userRank'
      },
      {
        model: LinkedSocialAccountModel,
        required: false,
        as: 'linkedAccounts'
      }]
    })

    const blockStatus = isDateInFuture(userDetails.blockChatTillDate)

    if (userDetails.isBlockChatPermanently || blockStatus) {
      return this.addError('UserBlockedForChatErrorType')
    }

    if (message.length > MAX_CHAT_CHARACTERS) {
      return this.addError('ExceedChatLengthErrorType')
    }

    // if (userWagerAmount < MIN_WAGER_AMOUNT_FOR_CHAT) {
    //   return this.addError('ChatMinAmountErrorType')
    // }
    const offensiveWords = await OffensiveWordModel.findAll({
      attributes: ['word']
    })
    const offensiveWordsArray = offensiveWords.map(row => row.word)
    const result = isContainOffensiveWord(message, offensiveWordsArray)
    const checkUrl = containsLink(message)

    const createChat = {
      actioneeId: userId,
      roomLanguageId: languageId || null,
      groupId: groupId || null,
      message: checkUrl ? URL_CHAT_MESSAGE : message,
      isContainOffensiveWord: result,
      containTip: amount || null,
      recipientId: receiverId || null,
      isPrivate: isPrivate || false
    }

    const userChat = await UserChatModel.create(createChat, { transaction: sequelizeTransaction })

    LiveChatsEmitter.emitLiveChats(
      {
        user: {
          userName,
          profileImageUrl: userDetails.profileImageUrl,
          linkedAccounts: userDetails.linkedAccounts,
          userRank: { moreDetails: userDetails.dataValues.moreDetails },
          isChatModerator: userDetails.isChatModerator
        },
        id: userChat.id,
        message: (result) ? DELETED_MESSAGE : message && (checkUrl) ? URL_CHAT_MESSAGE : message,
        userId,
        amount,
        receiverId,
        languageId,
        groupId,
        isContainOffensiveWord: result,
        recipientUser: {
          receiverName
        },
        createdAt: new Date()
      }
    )

    return { message: 'Message sent successfully', isContainOffensiveWord: result }
  }
}
