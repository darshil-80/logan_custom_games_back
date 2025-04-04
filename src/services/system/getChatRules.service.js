import ServiceBase from '../../libs/serviceBase'

export default class GetChatRuleService extends ServiceBase {
  async run () {
    const {
      dbModels: {
        ChatRule: ChatRuleModel
      }
    } = this.context
    const chatRules = await ChatRuleModel.findOne()

    if (!chatRules) return { message: 'No Rule Found' }

    const rules = Object.values(chatRules.rules)

    return { rules, message: 'Chat Rules fetched successfully' }
  }
}
