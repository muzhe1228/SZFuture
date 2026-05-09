const isProduction = import.meta.env.PROD

interface LoggerOptions {
  showTime?: boolean
  showLevel?: boolean
  useColors?: boolean
  stringify?: boolean
  colors?: Record<string, string>
}

const defaultOptions: LoggerOptions = {
  showTime: !isProduction,
  showLevel: true,
  useColors: !isProduction,
  stringify: false,
  colors: {
    log: '#374151',
    info: '#10b981',
    warn: '#f59e0b',
    error: '#ef4444',
    debug: '#8b5cf6',
  },
}

const getPrefix = (level: string): { prefix: string; style?: string } => {
  const timestamp = new Date().toLocaleString('zh-CN')
  const levelPrefix = defaultOptions.showLevel ? `[${level.toUpperCase()}]` : ''
  const timePrefix = defaultOptions.showTime ? `[${timestamp}]` : ''
  const prefix = `${timePrefix}${levelPrefix} `
  
  const color = defaultOptions.colors?.[level] || defaultOptions.colors?.log
  const style = defaultOptions.useColors && color ? `color: ${color}` : undefined
  
  return { prefix, style }
}

const formatArgs = (...args: any[]): any[] => {
  if (!defaultOptions.stringify) {
    return args
  }
  return args.map((arg) => {
    if (typeof arg === 'object') {
      return JSON.stringify(arg, null, 2)
    }
    return arg
  })
}

export const logger = {
  log: (...args: any[]): void => {
    if (!isProduction) {
      const { prefix, style } = getPrefix('log')
      const formattedArgs = formatArgs(...args)
      if (style) {
        console.log(`%c${prefix}`, style, ...formattedArgs)
      } else {
        console.log(prefix, ...formattedArgs)
      }
    }
  },

  info: (...args: any[]): void => {
    if (!isProduction) {
      const { prefix, style } = getPrefix('info')
      const formattedArgs = formatArgs(...args)
      if (style) {
        console.info(`%c${prefix}`, style, ...formattedArgs)
      } else {
        console.info(prefix, ...formattedArgs)
      }
    }
  },

  warn: (...args: any[]): void => {
    const { prefix, style } = getPrefix('warn')
    const formattedArgs = formatArgs(...args)
    if (style) {
      console.warn(`%c${prefix}`, style, ...formattedArgs)
    } else {
      console.warn(prefix, ...formattedArgs)
    }
  },

  error: (...args: any[]): void => {
    const { prefix, style } = getPrefix('error')
    const formattedArgs = formatArgs(...args)
    if (style) {
      console.error(`%c${prefix}`, style, ...formattedArgs)
    } else {
      console.error(prefix, ...formattedArgs)
    }
  },

  debug: (...args: any[]): void => {
    if (!isProduction) {
      const { prefix, style } = getPrefix('debug')
      const formattedArgs = formatArgs(...args)
      if (style) {
        console.debug(`%c${prefix}`, style, ...formattedArgs)
      } else {
        console.debug(prefix, ...formattedArgs)
      }
    }
  },

  success: (...args: any[]): void => {
    if (!isProduction) {
      const { prefix, style } = getPrefix('success')
      const formattedArgs = formatArgs(...args)
      if (style) {
        console.log(`%c${prefix}`, style, ...formattedArgs)
      } else {
        console.log(prefix, ...formattedArgs)
      }
    }
  },

  config: (options: Partial<LoggerOptions>): void => {
    Object.assign(defaultOptions, options)
  },
}

export default logger

export type { LoggerOptions }
