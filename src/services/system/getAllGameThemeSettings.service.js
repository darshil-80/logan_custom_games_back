import ServiceBase from '../../libs/serviceBase'

export default class GetGameThemeSettingsService extends ServiceBase {
  async run () {
    const {
      dbModels: {
        GameThemeBackgroundSetting: GameThemeBackgroundSettingModel,
        GameThemeHeroSetting: GameThemeHeroSettingModel
      },
      sequelizeTransaction
    } = this.context
    try {
      const gameThemeHeroSetting = await GameThemeHeroSettingModel.findOne({
        where: { active: true },
        transaction: sequelizeTransaction
      })

      const gameThemeBackgroundSetting = await GameThemeBackgroundSettingModel.findOne({
        where: { active: true },
        transaction: sequelizeTransaction
      })

      if (!gameThemeHeroSetting && !gameThemeBackgroundSetting) {
        return {
          default: true,
          gameThemeHeroSetting: null,
          gameThemeBackgroundSetting: null
        }
      } else {
        return {
          default: false,
          gameThemeHeroSetting: gameThemeHeroSetting?.toJSON(),
          gameThemeBackgroundSetting: gameThemeBackgroundSetting?.toJSON()
        }
      }
    } catch (error) {
      return this.addError('SomethingWentWrongErrorType', 'Something Went Wrong')
    }
  }
}
