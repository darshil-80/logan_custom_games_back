import { sendResponse } from '../../helpers/response.helpers'
import HelloWorldService from '../../services/demo/helloWorld.service'

/**
 * Demo Controller for handling all the request of /demo path
 *
 * @export
 * @class DemoController
 */
export default class DemoController {
  /**
   * Controller method to handle the request for /hello path
   *
   * @static
   * @param {object} req - object contains all the request params sent from the client
   * @param {object} res - object contains all the response params sent to the client
   * @param {function} next - function to execute next middleware
   * @memberof DemoController
   */
  static async helloWorld (req, res, next) {
    try {
      const { result, successful, errors } = await HelloWorldService.execute(req.query, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }
}
