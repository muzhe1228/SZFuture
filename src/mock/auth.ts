import Mock from 'mockjs'

const Random = Mock.Random

export function setupAuthMock() {
  // Authorization list
  Mock.mock(/\/api\/auth\/list/, 'get', (options: any) => {
    const { url } = options
    const params = new URLSearchParams(url.split('?')[1])
    const page = parseInt(params.get('page') || '1')
    const pageSize = parseInt(params.get('pageSize') || '20')
    
    const productModules = ['数据分析平台', '智能报表系统', '项目管理工具', '客户管理系统', '财务管理系统']
    const licenseTypes = ['试用版', '标准版', '专业版', '企业版']
    
    const list = []
    for (let i = 0; i < pageSize; i++) {
      list.push({
        id: (page - 1) * pageSize + i + 1,
        authNo: 'AUTH' + String(Random.integer(100000, 999999)),
        customerName: Random.cname() + Random.pick(['科技有限公司', '信息技术有限公司', '网络技术有限公司']),
        productName: Random.pick(productModules),
        licenseType: Random.pick(licenseTypes),
        status: Random.pick(['已授权', '已过期', '未授权', '已取消', '已激活', '已冻结', '已作废']),
        bindDate: Random.date('yyyy-MM-dd'),
        authStartDate: Random.date('yyyy-MM-dd'),
        authEndDate: Random.date('yyyy-MM-dd'),
        maxUsers: Random.pick([10, 50, 100, 500, 1000]),
        usedUsers: Random.integer(1, 100),
        authorizedBy: Random.cname(),
        createTime: Random.datetime('yyyy-MM-dd HH:mm:ss'),
        updateTime: Random.datetime('yyyy-MM-dd HH:mm:ss'),
        remark: Random.csentence(10, 30)
      })
    }
    
    return {
      code: 200,
      message: 'success',
      data: {
        list,
        total: 150
      }
    }
  })

  // Get auth detail
  Mock.mock(/\/api\/auth\/detail/, 'get', () => {
    return {
      code: 200,
      message: 'success',
      data: {
        id: Random.increment(10000),
        authCode: 'AUTH' + String(Random.integer(100000, 999999)),
        customerName: Random.cname() + Random.pick(['科技有限公司', '信息技术有限公司']),
        customerId: Random.increment(10000),
        productName: Random.pick(['数据分析平台', '智能报表系统', '项目管理工具']),
        productId: Random.increment(1000),
        licenseType: Random.pick(['试用版', '标准版', '专业版', '企业版']),
        authStatus: Random.pick(['已授权', '已过期', '未授权', '已取消']),
        startDate: Random.date('yyyy-MM-dd'),
        endDate: Random.date('yyyy-MM-dd'),
        maxUsers: Random.pick([10, 50, 100, 500, 1000]),
        usedUsers: Random.integer(1, 100),
        features: ['数据导出', '报表生成', '权限管理', 'API接口', '数据分析'],
        authorizedBy: Random.cname(),
        createTime: Random.datetime('yyyy-MM-dd HH:mm:ss'),
        updateTime: Random.datetime('yyyy-MM-dd HH:mm:ss'),
        remark: Random.csentence(10, 30)
      }
    }
  })

  // Grant authorization
  Mock.mock(/\/api\/auth\/grant/, 'post', () => {
    return {
      code: 200,
      message: '授权成功',
      data: {
        id: Random.increment(10000),
        authCode: 'AUTH' + String(Random.integer(100000, 999999))
      }
    }
  })

  // Revoke authorization
  Mock.mock(/\/api\/auth\/revoke/, 'post', () => {
    return {
      code: 200,
      message: '取消授权成功',
      data: null
    }
  })

  // Update authorization
  Mock.mock(/\/api\/auth\/update/, 'put', () => {
    return {
      code: 200,
      message: 'success',
      data: null
    }
  })
}
