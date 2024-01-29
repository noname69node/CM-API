import { createLogger, format, transports, Logger } from 'winston'
import 'dotenv/config'

const logger: Logger = createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'warn',
  format: format.combine(
    format.colorize(),
    format.printf((info) => `${info.level}: ${info.message}`)
  ),
  transports: [new transports.Console()]
})

export default logger
