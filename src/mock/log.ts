import Mock from 'mockjs'

const Random = Mock.Random

export function setupLogMock() {
  // Operation logs
  Mock.mock(/\/api\/log\/operation\/list/, 'get', (options: any) => {
    const { url } = options
    const params = new URLSearchParams(url.split('?')[1])
    const page = parseInt(params.get('page') || '1')
    const pageSize = parseInt(params.get('pageSize') || '20')
    
    const operationTypes = ['新增', '修改', '删除', '查询', '导出', '导入', '登录', '退出']
    const operationModules = ['用户管理', '角色管理', '部门管理', '订单管理', '客户管理', '授权管理', '产品管理', '系统配置']
    const operationStatus = ['成功', '失败']
    const requestMethods = ['GET', 'POST', 'PUT', 'DELETE']
    const operators = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十']
    
    const list = []
    for (let i = 0; i < pageSize; i++) {
      const operator = Random.pick(operators)
      list.push({
        id: (page - 1) * pageSize + i + 1,
        operator,
        operatorId: Random.increment(1000),
        department: Random.pick(['华东分部-研发部', '华南分部-技术部', '总部-人力资源部', '华北分部-市场部']),
        operationType: Random.pick(operationTypes),
        operationModule: Random.pick(operationModules),
        operationDesc: Random.pick([
          '新增用户' + Random.cname(),
          '修改角色权限',
          '删除部门信息',
          '导出订单列表',
          '登录系统',
          '修改系统配置',
          '授权产品给客户',
          '创建试用申请'
        ]),
        requestUrl: '/api/' + Random.word() + '/' + Random.word(),
        requestMethod: Random.pick(requestMethods),
        requestParams: '{' + Random.word() + ': ' + Random.string('lower', 5) + '}',
        responseStatus: Random.integer(200, 500),
        operationStatus: Random.pick(operationStatus),
        errorMsg: Random.boolean() ? Random.csentence(5, 15) : '-',
        ip: Random.ip(),
        browser: Random.pick(['Chrome 120', 'Firefox 121', 'Safari 17', 'Edge 120']),
        os: Random.pick(['Windows 11', 'macOS Sonoma', 'Ubuntu 22.04']),
        executionTime: Random.integer(10, 2000) + 'ms',
        operationTime: Random.datetime('yyyy-MM-dd HH:mm:ss')
      })
    }
    
    return {
      code: 200,
      message: 'success',
      data: {
        list,
        total: 500
      }
    }
  })

  // Get operation log detail
  Mock.mock(/\/api\/log\/operation\/detail/, 'get', () => {
    return {
      code: 200,
      message: 'success',
      data: {
        id: Random.increment(10000),
        operator: Random.cname(),
        operatorId: Random.increment(1000),
        department: Random.pick(['华东分部-研发部', '华南分部-技术部']),
        operationType: Random.pick(['新增', '修改', '删除', '查询', '导出', '导入', '登录', '退出']),
        operationModule: Random.pick(['用户管理', '角色管理', '部门管理', '订单管理']),
        operationDesc: Random.csentence(5, 20),
        requestUrl: '/api/' + Random.word() + '/' + Random.word(),
        requestMethod: Random.pick(['GET', 'POST', 'PUT', 'DELETE']),
        requestParams: JSON.stringify({
          [Random.word()]: Random.string('lower', 8),
          [Random.word()]: Random.integer(1, 100)
        }, null, 2),
        responseData: JSON.stringify({
          code: 200,
          message: 'success',
          data: {}
        }, null, 2),
        responseStatus: Random.pick([200, 400, 401, 403, 500]),
        operationStatus: Random.pick(['成功', '失败']),
        errorMsg: Random.boolean() ? Random.csentence(5, 20) : '-',
        ip: Random.ip(),
        browser: Random.pick(['Chrome 120', 'Firefox 121', 'Safari 17']),
        os: Random.pick(['Windows 11', 'macOS Sonoma', 'Ubuntu 22.04']),
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        executionTime: Random.integer(10, 2000) + 'ms',
        operationTime: Random.datetime('yyyy-MM-dd HH:mm:ss')
      }
    }
  })

  // System logs
  Mock.mock(/\/api\/log\/system\/list/, 'get', (options: any) => {
    const { url } = options
    const params = new URLSearchParams(url.split('?')[1])
    const page = parseInt(params.get('page') || '1')
    const pageSize = parseInt(params.get('pageSize') || '20')
    
    const logLevels = ['INFO', 'WARN', 'ERROR', 'DEBUG']
    const logModules = ['系统服务', '数据库', '缓存服务', '消息队列', '文件服务', '认证服务', '网关服务']
    const logStatus = ['正常', '异常']
    
    const list = []
    for (let i = 0; i < pageSize; i++) {
      list.push({
        id: (page - 1) * pageSize + i + 1,
        logLevel: Random.pick(logLevels),
        logModule: Random.pick(logModules),
        logSource: Random.pick(['服务器-01', '服务器-02', '服务器-03', '数据库主节点', '缓存节点-01']),
        logMessage: Random.pick([
          '系统启动完成',
          '数据库连接成功',
          '缓存清理完成',
          '定时任务执行完成',
          '服务健康检查通过',
          '内存使用率超过阈值',
          '数据库连接池已满',
          '请求超时异常',
          '文件上传失败',
          '认证token过期'
        ]),
        logStatus: Random.pick(logStatus),
        stackTrace: Random.boolean() ? 'Error: ' + Random.csentence(10, 30) + '\n    at ' + Random.word() + '.js:' + Random.integer(10, 500) : '-',
        ip: Random.ip(),
        createTime: Random.datetime('yyyy-MM-dd HH:mm:ss')
      })
    }
    
    return {
      code: 200,
      message: 'success',
      data: {
        list,
        total: 1000
      }
    }
  })

  // Get system log detail
  Mock.mock(/\/api\/log\/system\/detail/, 'get', () => {
    return {
      code: 200,
      message: 'success',
      data: {
        id: Random.increment(10000),
        logLevel: Random.pick(['INFO', 'WARN', 'ERROR', 'DEBUG']),
        logModule: Random.pick(['系统服务', '数据库', '缓存服务', '消息队列']),
        logSource: Random.pick(['服务器-01', '服务器-02', '数据库主节点']),
        logMessage: Random.csentence(10, 50),
        logStatus: Random.pick(['正常', '异常']),
        stackTrace: Random.boolean() ? `Error: ${Random.csentence(10, 30)}
    at ${Random.word()}.js:${Random.integer(10, 500)}
    at ${Random.word()}.js:${Random.integer(10, 500)}
    at ${Random.word()}.js:${Random.integer(10, 500)}` : '-',
        ip: Random.ip(),
        threadName: 'thread-' + Random.integer(1, 20),
        requestId: Random.guid(),
        createTime: Random.datetime('yyyy-MM-dd HH:mm:ss')
      }
    }
  })

  // Export operation logs
  Mock.mock(/\/api\/log\/operation\/export/, 'post', () => {
    return {
      code: 200,
      message: '导出成功',
      data: {
        downloadUrl: '/api/files/operation_logs_' + Random.date('yyyyMMdd') + '.xlsx'
      }
    }
  })

  // Export system logs
  Mock.mock(/\/api\/log\/system\/export/, 'post', () => {
    return {
      code: 200,
      message: '导出成功',
      data: {
        downloadUrl: '/api/files/system_logs_' + Random.date('yyyyMMdd') + '.xlsx'
      }
    }
  })

  // Clean operation logs
  Mock.mock(/\/api\/log\/operation\/clean/, 'post', () => {
    return {
      code: 200,
      message: '清理成功',
      data: {
        cleanedCount: Random.integer(100, 1000)
      }
    }
  })

  // Clean system logs
  Mock.mock(/\/api\/log\/system\/clean/, 'post', () => {
    return {
      code: 200,
      message: '清理成功',
      data: {
        cleanedCount: Random.integer(100, 1000)
      }
    }
  })
}
