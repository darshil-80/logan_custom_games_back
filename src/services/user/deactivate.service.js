import ServiceBase from '../../libs/serviceBase'

/**
 * it provides service for soft deleting a user
 * @export
 * @class DeactivateService
 * @extends {ServiceBase}
 */
export default class DeactivateService extends ServiceBase {
  async run () {
    return { message: 'In Progress' }
  }
}
