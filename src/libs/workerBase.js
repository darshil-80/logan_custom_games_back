import _ from 'lodash'
import logger from './logger'

/**
 *
 *
 * @class WorkerBase
 *
 * @classdesc Worker Base class for creating workers for business logic
 * and perform some task and log them properly
 *
 * @hideconstructor
 */
class WorkerBase {
  #_args = {}
  #_context = {}
  #_errors = {}
  #_successful = null
  #_failed = null
  #_result = null

  constructor () {
    this.#_args = arguments[0]
    this.#_context = arguments[1]
    this.#_errors = {}
    this.#_successful = null
    this.#_failed = null
    this.#_result = null
    this.#validateWorkerInputs()
  }

  /**
   *
   * @readonly
   * @memberof WorkerBase
   * @description For reading the context of the worker object
   */
  get context () {
    return this.#_context
  }

  /**
   *
   *
   * @readonly
   * @memberof WorkerBase
   */
  get args () {
    return this.#_args
  }

  /**
   *
   *
   * @readonly
   */
  get result () {
    return this.#_result
  }

  /**
   *
   *
   * @readonly
   */
  get failed () {
    return this.#_failed
  }

  /**
   *
   *
   * @readonly
   */
  get errors () {
    return this.#_errors
  }

  /**
   *
   *
   * @readonly
   */
  get successful () {
    return this.#_successful
  }

  /**
   *
   *
   * @readonly
   */
  get log () {
    return {
      info: (logTitle, argHash = {}) => {
        argHash.klass = this.constructor
        logger.info(logTitle, argHash)
      },
      debug: (logTitle, argHash = {}) => {
        argHash.klass = this.constructor
        logger.debug(logTitle, argHash)
      },
      error: (logTitle, argHash = {}) => {
        argHash.klass = this.constructor
        logger.error(logTitle, argHash)
      }
    }
  }

  /**
   *
   * @private
   * @function
   * @async
   */
  async #tryExecuting () {
    if (_.size(this.errors)) {
      this.#_failed = true
      this.#_successful = false
      return
    }
    try {
      this.#_result = await this.run()
    } catch (error) {
      logger.error('Exception raised in Worker', { klass: this.constructor, message: error.message, context: this.args, exception: error, userCtx: this.context })
      throw error
    }
    this.#_successful = !_.size(this.errors)
    this.#_failed = !!_.size(this.errors)
  }

  /**
   *
   *
   * @param {string} attribute
   * @param {*} errorMessage
   * @return {undefined}
   */
  addError (attribute, errorMessage) {
    if (attribute !== _.camelCase(attribute)) throw new Error(`${attribute} should be camel cased in addError()`)
    logger.debug('Custom Validation Failed', { klass: this.constructor, message: errorMessage, context: { attribute }, userCtx: this.context, fault: this.errors })

    const errors = this.#_errors[this.constructor.name] = this.#_errors[this.constructor.name] || {}
    if (!errors[attribute]) return _.extend(errors, { [attribute]: `${_.startCase(attribute)} ${errorMessage}` })
    errors[attribute] = errors[attribute] instanceof Array ? errors[attribute] : [errors[attribute]]
    errors[attribute].push(`${_.startCase(attribute)} ${errorMessage}`)
  }

  /**
   *
   *
   * @instance
   * @param {any[]} errors
   */
  mergeErrors (errors) {
    _.defaults(this.#_errors, errors)
  }

  /**
   *
   * @instance
   * @private
   * @async
   */
  async #validateWorkerInputs () {
    const schema = this.constraints
    if (schema) {
      const valid = schema(this.#_args)
      if (!valid) {
        const validationErrors = schema.errors
        const errors = validationErrors.map(error => error.message)
        _.extend(this.errors, { [this.constructor.name]: errors })
        logger.debug('Worker input Validation Failed', { klass: this.constructor, message: 'Validation Failed', context: this.args, userCtx: this.context, fault: this.errors })
      }
    }
  }

  // Static methods

  /**
   *
   * @static
   * @async
   */
  static async run () {
    logger.info(`Worker Started: ${this.name}`, { context: this.args, userCtx: this.context, wrap: 'start' })
    const args = arguments
    const instance = new this(...args)
    await instance.#tryExecuting()
    if (_.size(instance.errors)) throw instance.errors
    logger.info(`Worker Finished: ${this.name}`, { context: this.args, userCtx: this.context, wrap: 'end' })
    return instance.result
  }

  /**
   *
   * @static
   * @async
   */
  static async execute () {
    logger.info(`Worker Started: ${this.name}`, { context: this.args, userCtx: this.context, wrap: 'start' })
    const args = arguments
    const instance = new this(...args)
    await instance.#tryExecuting()
    logger.info(`Worker Finished: ${this.name}`, { context: this.args, userCtx: this.context, wrap: 'end' })
    return instance
  }
}

export default WorkerBase
