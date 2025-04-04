import ajv from '../../libs/ajv'
import ServiceBase from '../../libs/serviceBase'
import Sequelize, { Op } from 'sequelize'
import moment from 'moment'
import { omitBy, isNil } from 'lodash'
import { DELETED_MESSAGE, GLOBAL_GROUP_ID } from '../../libs/constants'

const schema = {
  type: 'object',
  properties: {
    limit: { type: 'string' },
    offset: { type: 'string' },
    search: { type: 'string' },
    startDate: { type: 'string' },
    endDate: { type: 'string' },
    status: { type: 'string' },
    languageId: { type: 'string' },
    groupId: { type: 'string' }
  }
}

const constraints = ajv.compile(schema)

export default class GetUserChatService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const {
      dbModels: {
        UserChat: UserChatModel,
        User: UserModel,
        RankingLevel: RankingLevelModel,
        LinkedSocialAccount: LinkedSocialAccountModel
      },
      sequelizeTransaction
    } = this.context

    const { limit, offset, search, startDate, endDate, status, languageId, groupId } = this.args
    let whereCondition = {
      message: (search)
        ? {
            [Op.iLike]: `%${search}%`
          }
        : null,
      status: (status) || 1,
      roomLanguageId: languageId || null,
      groupId: groupId || null,
      isPrivate: false,
      createdAt: (startDate && endDate) ? { [Op.between]: [moment(startDate).startOf('day'), moment(endDate).endOf('day')] } : null
    }

    if (groupId && parseInt(groupId) !== GLOBAL_GROUP_ID) {
      whereCondition = { ...whereCondition, roomLanguageId: null }
    }
    const filterCondition = omitBy(whereCondition, isNil)

    const chatDetails = await UserChatModel.findAndCountAll({
      where: filterCondition,
      subQuery: false,
      attributes: [
        [Sequelize.literal(`CASE WHEN "is_contain_offensive_word" = true THEN '${DELETED_MESSAGE}' ELSE "message" END`), 'message'],
        ['room_language_id', 'languageId'],
        ['actionee_id', 'userId'],
        ['contain_tip', 'amount'],
        ['recipient_id', 'receiverId'],
        'groupId',
        'id',
        'isContainOffensiveWord',
        'createdAt'
      ],
      include: [
        {
          model: UserModel,
          as: 'user',
          attributes: ['userName', 'profileImageUrl', 'isChatModerator'],
          include: [
            {
              attributes: ['status', ['username', 'socialAccountUserName'], 'socialAccount'],
              model: LinkedSocialAccountModel,
              as: 'linkedAccounts'
            },
            {
              model: RankingLevelModel,
              as: 'userRank',
              attributes: ['moreDetails']
            }
          ]
        },
        {
          model: UserModel,
          as: 'recipientUser',
          attributes: [['user_name', 'receiverName']]
        }
      ],
      order: [['id', 'DESC']],
      limit: limit || 10,
      offset: offset || 0,
      transaction: sequelizeTransaction
    })

    if (!chatDetails) this.addError('ChatNotFoundErrorType')
    else return chatDetails
  }
}
