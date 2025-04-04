import ajv from '../../libs/ajv'
import ServiceBase from '../../libs/serviceBase'

const schema = {
  type: 'object',
  properties: {
    isPrivate: { type: 'boolean' }
  }
}

const constraints = ajv.compile(schema)

/**
 * Provides service for the updating is private functionality
 * @export
 * @class EnableIsPrivateService
 * @extends {ServiceBase}
 */
export default class EnableIsPrivateService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const {
      dbModels: {
        User: UserModel
      },
      auth: { id: userId },
      sequelizeTransaction
    } = this.context

    const { isPrivate } = this.args

    await UserModel.update({
      isPrivate
    }, {
      where: {
        id: userId
      },
      transaction: sequelizeTransaction
    })
    return { message: 'Is-Private updated successfully' }
  }
}
