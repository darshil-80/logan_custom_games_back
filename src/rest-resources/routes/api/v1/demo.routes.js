import express from 'express'
import DemoController from '../../../controllers/demo.controller'
import contextMiddleware from '../../../middlewares/context.middleware'
import requestValidationMiddleware from '../../../middlewares/requestValidation.middleware'
import responseValidationMiddleware from '../../../middlewares/responseValidation.middleware'

const demoRoutes = express.Router()

/**
 * @example
 *
 * httpMethodName + routeName + Schemas in camel case
 * suppose get method and hello route then
 * getHelloSchemas
 *
 * suppose post method and hello-world route then
 * postHelloWorldSchemas
 */

const getHelloSchemas = {
  querySchema: {
    $ref: '/demo.json'
  },
  responseSchema: {
    default: {
      type: 'object',
      properties: {
        message: { type: 'string' }
      },
      required: ['message']
    }
  }
}

demoRoutes
  .route('/hello')
  .get(
    contextMiddleware(false),
    requestValidationMiddleware(getHelloSchemas),
    DemoController.helloWorld,
    responseValidationMiddleware(getHelloSchemas)
  )

export default demoRoutes
