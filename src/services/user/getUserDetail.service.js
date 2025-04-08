import { generateServerSeedHash } from '../../helpers/encryption.helpers';
import inMemoryDB from '../../libs/inMemoryDb'
import ServiceBase from '../../libs/serviceBase'
/**
 * Provides service to show user details
 * @export
 * @class GetUserDetailService
 * @extends {ServiceBase}
 */
export default class GetUserDetailService extends ServiceBase {
  async run () {
    const userId = this.args.userId
    let user = await inMemoryDB.get('users', userId);
    
    if (!user) {
      await inMemoryDB.set('users', userId, {
        id: userId,
        wallet: {
          "amount": 1000,
          "currencyId": "2",
          ownerId: userId,
          "currency": {
              "id": "2",
              "name": "US Doller",
              "code": "USD",
              "symbol": "$"
          }
        }
      })

      user = await inMemoryDB.get('users', userId);

      generateServerSeedHash(userId)
    }

    return user
  }
}
