import fs from 'fs'
import path from 'path'
import * as util from 'util'
import winston from 'winston'
import config from '../configs/app.config'

const { combine, timestamp, label, printf, colorize } = winston.format

const logDir = 'logs'

// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir)
}

const transports = [
  new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error', handleExceptions: true }),
  new winston.transports.File({ filename: path.join(logDir, 'combined.log'), handleExceptions: true })
]

// if (config.get('env') !== 'production') {
transports.push(new winston.transports.Console({
  handleExceptions: true
}))
// }

const customFormat = printf((info) => {
  let msg = `Process: ${process.pid} ${info.timestamp} [${info.label}] ${info.level}: `
  info = typeof info.message === 'object' ? info.message : info

  msg += info.logTitle ? `${info.logTitle} Message: ${info.message || 'No Message'} ` : info.message || 'No Message '
  msg += info.class ? `class: ${typeof info.class === 'object' ? util.inspect(info.class) : info.class} ` : ''
  msg += info.context ? `context: ${typeof info.context === 'object' ? util.inspect(info.context) : info.context} ` : ''
  msg += info.metadata ? `metadata: ${typeof info.metadata === 'object' ? util.inspect(info.metadata) : info.metadata} ` : ''
  msg += info.exceptionBacktrace ? `exceptionBacktrace: ${typeof info.exceptionBacktrace === 'object' ? util.inspect(info.exceptionBacktrace) : info.exceptionBacktrace} ` : ''
  msg += info.fault ? `fault: ${typeof info.fault === 'object' ? util.inspect(info.fault) : info.fault} ` : ''
  return msg
})

const format = combine(
  colorize(),
  label({ label: config.get('app.name') }),
  timestamp(),
  customFormat
)

const winstonLogger = winston.createLogger({ level: config.get('log_level') || 'info', transports: transports, exitOnError: false, format })

export default winstonLogger
