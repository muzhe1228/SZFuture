# Logger 使用文档

## 概述

Logger 是一个轻量级的日志工具，提供了不同级别的日志输出，支持颜色配置和环境区分。

## 特性

- ✅ 支持多种日志级别（log, info, warn, error, debug, success）
- ✅ 开发环境彩色输出，生产环境静默
- ✅ 支持时间戳和级别标识
- ✅ 对象保持原始数据格式输出（可展开查看）
- ✅ 动态配置能力

## 基本使用

```typescript
import { logger } from '@/utils/logger'

// 基本日志
logger.log('普通日志')
logger.info('信息日志')
logger.warn('警告日志')
logger.error('错误日志')
logger.debug('调试日志')
logger.success('成功日志')

// 带参数日志
logger.info('用户登录', { username: 'admin', id: 1 })
logger.error('请求失败', { url: '/api/test', error: err })
```

## 日志级别说明

| 级别 | 方法 | 颜色 | 生产环境 | 说明 |
|------|------|------|----------|------|
| log | logger.log() | 深灰 | 静默 | 普通日志 |
| info | logger.info() | 绿色 | 静默 | 信息日志 |
| warn | logger.warn() | 橙色 | 输出 | 警告日志 |
| error | logger.error() | 红色 | 输出 | 错误日志 |
| debug | logger.debug() | 紫色 | 静默 | 调试日志 |
| success | logger.success() | 绿色 | 静默 | 成功日志 |

## 配置选项

```typescript
logger.config({
  showTime: true,     // 是否显示时间戳（默认：开发环境true）
  showLevel: true,    // 是否显示级别标识（默认：true）
  useColors: true,    // 是否使用颜色（默认：开发环境true）
  stringify: false,   // 是否将对象转为JSON字符串（默认：false）
  colors: {          // 自定义颜色配置
    log: '#374151',
    info: '#10b981',
    warn: '#f59e0b',
    error: '#ef4444',
    debug: '#8b5cf6',
  }
})
```

## 输出示例

```
[2024/1/1 10:00:00][INFO] API请求成功 {url: "/api/user", response: {...}}
[2024/1/1 10:00:01][ERROR] 请求失败 {url: "/api/test", error: {...}}
[2024/1/1 10:00:02][WARN] 参数验证失败 {field: "email", message: "格式错误"}
```

## 注意事项

1. **生产环境**：log/info/debug/success 在生产环境会自动静默，只保留 warn/error
2. **对象输出**：对象保持原始格式，可在控制台展开查看
3. **颜色配置**：颜色只在开发环境生效，生产环境使用默认颜色
4. **性能考虑**：避免在高频调用处使用 logger.debug，可通过 logger.config() 关闭

## 在 HTTP 请求拦截器中的使用

```typescript
import { logger } from '@/utils/logger'

request.interceptors.response.use(
  (response) => {
    logger.info(`[API] ${response.config.method} ${response.config.url}`, {
      params: response.config.params,
      response: response.data
    })
    return response.data
  },
  (error) => {
    logger.error(`[API ERROR] ${error.config.method} ${error.config.url}`, {
      error: error.response?.data
    })
    return Promise.reject(error)
  }
)
```
