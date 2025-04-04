import { sendResponse } from '../../helpers/response.helpers'
import SendUserTipService from '../../services/liveChat/sendUserTip.service'
import GetLanguageRoomService from '../../services/liveChat/getLanguageRoom.service'
import GetGroupChatService from '../../services/liveChat/getChatGroup.service'
/**
 * Live Chat Controller for handling all the request of /live-chat path
 *
 * @export
 * @class LiveChatController
 */
export default class LiveChatController {
  /**
   * Controller method to handle the request for /live-chat path
   *
   * @static
   * @param {object} req - object contains all the request params sent from the client
   * @param {object} res - object contains all the response params sent to the client
   * @param {function} next - function to execute next middleware
   * @memberof LiveChatController
   */
  static async sendTip (req, res, next) {
    try {
      const { result, successful, errors } = await SendUserTipService.execute(req.body, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  static async getLanguageRooms (req, res, next) {
    try {
      const { result, successful, errors } = await GetLanguageRoomService.execute(req.query, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  static async getGroupChat (req, res, next) {
    try {
      const { result, successful, errors } = await GetGroupChatService.execute(req.query, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }
}
