import ServiceBase from '../../libs/serviceBase'
// import ajv from '../../libs/ajv'
import { v4 as uuid } from 'uuid'
import { deleteFile, uploadFile } from '../../utils/upload.utils'

// const schema = {
//   type: 'object',
//   properties: {},
//   required: []
// }

// const constraints = ajv.compile(schema)

/**
 * Provides service for the updating user profile photo functionality
 * @export
 * @class UploadProfilePhotoService
 * @extends {ServiceBase}
 */
export default class UploadProfilePhotoService extends ServiceBase {
  // get constraints () {
  //   return constraints
  // }

  async run () {
    const {
      dbModels: { User: UserModel },
      auth: { id: userId },
      sequelizeTransaction
    } = this.context

    const userExists = await UserModel.findOne({
      where: {
        id: userId
      },
      transaction: sequelizeTransaction
    })

    if (!userExists) {
      return this.addError('UserNotExistsErrorType', 'User Not Found')
    }

    const file = this.args.file

    try {
      // const awaitedFile = await file
      let storedImagePath = {}
      //  const stream = await file.createReadStream()
      const originalName = file.originalname.split('.')[0]
      let fileName = `${originalName}_${userId}_${uuid()}.${file.mimetype.split('/')[1]}`
      fileName = fileName.split(' ').join('')

      await deleteFile(userExists.profileImageUrl);
      storedImagePath = await uploadFile(file, `userProfileImage/${userId.toString()}`, fileName);

      if (storedImagePath) {
        const updated = await UserModel.update({
          profileImageUrl: storedImagePath
        }, {
          where: {
            id: userId
          },
          transaction: sequelizeTransaction
        })

        return {
          uploaded: updated[0] === 1,
          location: storedImagePath
        }
      } else {
        return this.addError('FileUploadFailedErrorType', 'File upload failed')
      }
    } catch (e) {
      return this.addError('SomethingWentWrongErrorType', 'Something went wrong')
    }
  }
}
