const isProduction = import.meta.env.PROD

interface LoggerOptions {
  showTime?: boolean
  showLevel?: boolean
}

const defaultOptions: LoggerOptions = {
  showTime: !isProduction,
  showLevel: true,
}

const formatMessage = (level: string, ...args: any[]): string => {
  const timestamp = new Date().toLocaleString('zh-CN')
  const levelPrefix = defaultOptions.showLevel ? `[${level.toUpperCase()}]` : ''
  const timePrefix = defaultOptions.showTime ? `[${timestamp}]` : ''
  return `${timePrefix}${levelPrefix} ${args
    .map((arg) => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)))
    .join(' ')}`
}

export const logger = {
  log: (...args: any[]): void => {
    if (!isProduction) {
      console.log(formatMessage('log', ...args))
    }
  },

  info: (...args: any[]): void => {
    if (!isProduction) {
      console.info(formatMessage('info', ...args))
    }
  },

  warn: (...args: any[]): void => {
    console.warn(formatMessage('warn', ...args))
  },

  error: (...args: any[]): void => {
    console.error(formatMessage('error', ...args))
  },

  debug: (...args: any[]): void => {
    if (!isProduction) {
      console.debug(formatMessage('debug', ...args))
    }
  },
}

export default logger
