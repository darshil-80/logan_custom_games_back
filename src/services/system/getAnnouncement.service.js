import ajv from '../../libs/ajv'
import ServiceBase from '../../libs/serviceBase'
import { Op } from 'sequelize'
import moment from 'moment'
import { omitBy, isNil } from 'lodash'

const schema = {
  type: 'object',
  properties: {
    limit: { type: 'string' },
    offset: { type: 'string' },
    search: { type: 'string' },
    startDate: { type: 'string' },
    endDate: { type: 'string' },
    id: { type: 'string' },
    status: { type: 'string' },
    isPinned: { type: 'string' }
  }
}

const constraints = ajv.compile(schema)

export default class GetAnnouncementService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const {
      dbModels: {
        Announcement: AnnouncementModel
      },
      sequelizeTransaction
    } = this.context

    const { id, limit, offset, search, startDate, endDate, status, isPinned } = this.args

    const whereCondition = {
      title: (search)
        ? {
            [Op.iLike]: `%${search}%`
          }
        : null,
      status: (status) || true,
      isPinned: isPinned || null,
      createdAt: (startDate && endDate) ? { [Op.between]: [moment(startDate).startOf('day'), moment(endDate).endOf('day')] } : null
    }

    const filterCondition = omitBy(whereCondition, isNil)

    if (id) {
      const announcementDetails = await AnnouncementModel.findOne({
        where: { id },
        transaction: sequelizeTransaction
      })

      if (!announcementDetails) this.addError('AnnouncementNotFoundErrorType')
      else return { count: 1, rows: [announcementDetails] }
    } else {
      const announcementDetails = await AnnouncementModel.findAndCountAll({
        where: filterCondition,
        order: [['updatedAt', 'desc']],
        limit: limit || 10,
        offset: offset || 0,
        transaction: sequelizeTransaction
      })

      if (!announcementDetails) this.addError('AnnouncementNotFoundErrorType')
      else return { count: announcementDetails.count, rows: announcementDetails.rows }
    }
  }
}
