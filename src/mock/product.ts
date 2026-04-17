import Mock from 'mockjs'

const Random = Mock.Random

export function setupProductMock() {
  // Product module list (tree structure for module config)
  Mock.mock(/\/api\/product\/module\/list/, 'get', () => {
    return {
      code: 200,
      message: 'success',
      data: {
        list: [
          {
            id: 1,
            name: '产品名称',
            type: '产品',
            status: '启用',
            description: '',
            children: [
              {
                id: 11,
                name: '版本号',
                type: '版本',
                status: '启用',
                description: '2026年03月27日更新',
                children: [
                  { id: 111, name: '模块管理', type: '功能', status: '启用', description: '功能说明' },
                  { id: 112, name: '菜单管理', type: '功能', status: '启用', description: '' },
                  { id: 113, name: '模块管理', type: '功能', status: '启用', description: '' },
                  { id: 114, name: '菜单管理', type: '功能', status: '启用', description: '' }
                ]
              }
            ]
          },
          {
            id: 2,
            name: '产品名称1',
            type: '产品',
            status: '启用',
            description: '',
            children: [
              { id: 21, name: '版本号', type: '版本', status: '启用', description: '', children: [] }
            ]
          }
        ],
        total: 2
      }
    }
  })

  // Product list
  Mock.mock(/\/api\/product\/list/, 'get', (options: any) => {
    const { url } = options
    const params = new URLSearchParams(url.split('?')[1])
    const page = parseInt(params.get('page') || '1')
    const pageSize = parseInt(params.get('pageSize') || '20')
    
    const productStatus = ['已上线', '开发中', '已下线']
    const productTypes = ['SaaS', '本地部署', '混合部署']
    
    const list = []
    for (let i = 0; i < pageSize; i++) {
      list.push({
        id: (page - 1) * pageSize + i + 1,
        productCode: 'PROD' + String(Random.integer(1000, 9999)),
        productName: Random.pick(['数据分析平台', '智能报表系统', '项目管理工具', '客户管理系统', '财务管理系统', '人力资源系统']),
        productVersion: Random.pick(['V1.0', 'V2.0', 'V2.5', 'V3.0']),
        productType: Random.pick(productTypes),
        productStatus: Random.pick(productStatus),
        description: Random.csentence(10, 30),
        licenseCount: Random.integer(0, 500),
        activeCount: Random.integer(0, 200),
        manager: Random.cname(),
        createTime: Random.datetime('yyyy-MM-dd HH:mm:ss'),
        updateTime: Random.datetime('yyyy-MM-dd HH:mm:ss')
      })
    }
    
    return {
      code: 200,
      message: 'success',
      data: {
        list,
        total: 35
      }
    }
  })

  // Get product detail
  Mock.mock(/\/api\/product\/detail/, 'get', () => {
    return {
      code: 200,
      message: 'success',
      data: {
        id: Random.increment(1000),
        productCode: 'PROD' + String(Random.integer(1000, 9999)),
        productName: Random.pick(['数据分析平台', '智能报表系统', '项目管理工具']),
        productVersion: Random.pick(['V1.0', 'V2.0', 'V2.5', 'V3.0']),
        productType: Random.pick(['SaaS', '本地部署', '混合部署']),
        productStatus: Random.pick(['已上线', '开发中', '已下线']),
        description: Random.csentence(10, 50),
        features: ['数据可视化', '报表导出', '权限管理', 'API接口', '数据分析', '实时监控'],
        manager: Random.cname(),
        managerPhone: /^1[3-9]\d{9}$/,
        managerEmail: Random.email(),
        licenseCount: Random.integer(0, 500),
        activeCount: Random.integer(0, 200),
        createTime: Random.datetime('yyyy-MM-dd HH:mm:ss'),
        updateTime: Random.datetime('yyyy-MM-dd HH:mm:ss')
      }
    }
  })

  // Create product
  Mock.mock(/\/api\/product\/create/, 'post', () => {
    return {
      code: 200,
      message: 'success',
      data: {
        id: Random.increment(1000),
        productCode: 'PROD' + String(Random.integer(1000, 9999))
      }
    }
  })

  // Update product
  Mock.mock(/\/api\/product\/update/, 'put', () => {
    return {
      code: 200,
      message: 'success',
      data: null
    }
  })

  // Delete product
  Mock.mock(/\/api\/product\/delete/, 'delete', () => {
    return {
      code: 200,
      message: 'success',
      data: null
    }
  })

  // License template list
  Mock.mock(/\/api\/license-template\/list/, 'get', (options: any) => {
    const { url } = options
    const params = new URLSearchParams(url.split('?')[1])
    const page = parseInt(params.get('page') || '1')
    const pageSize = parseInt(params.get('pageSize') || '20')
    
    const templateTypes = ['试用版', '标准版', '专业版', '企业版', '定制版']
    const templateStatus = ['启用', '禁用']
    
    const list = []
    for (let i = 0; i < pageSize; i++) {
      list.push({
        id: (page - 1) * pageSize + i + 1,
        templateCode: 'TPL' + String(Random.integer(1000, 9999)),
        templateName: Random.pick(['数据分析平台', '智能报表系统', '项目管理工具']) + '-' + Random.pick(templateTypes),
        templateType: Random.pick(templateTypes),
        templateStatus: Random.pick(templateStatus),
        validDays: Random.pick([7, 14, 30, 365, 730]),
        maxUsers: Random.pick([5, 10, 50, 100, 500, 1000]),
        features: ['数据导出', '报表生成', '权限管理', 'API接口'].slice(0, Random.integer(1, 4)),
        description: Random.csentence(10, 30),
        createUser: Random.cname(),
        createTime: Random.datetime('yyyy-MM-dd HH:mm:ss'),
        updateTime: Random.datetime('yyyy-MM-dd HH:mm:ss')
      })
    }
    
    return {
      code: 200,
      message: 'success',
      data: {
        list,
        total: 25
      }
    }
  })

  // Get license template detail
  Mock.mock(/\/api\/license-template\/detail/, 'get', () => {
    return {
      code: 200,
      message: 'success',
      data: {
        id: Random.increment(1000),
        templateCode: 'TPL' + String(Random.integer(1000, 9999)),
        templateName: Random.pick(['数据分析平台', '智能报表系统']) + '-' + Random.pick(['试用版', '标准版', '专业版', '企业版']),
        templateType: Random.pick(['试用版', '标准版', '专业版', '企业版', '定制版']),
        templateStatus: Random.pick(['启用', '禁用']),
        productId: Random.increment(1000),
        productName: Random.pick(['数据分析平台', '智能报表系统', '项目管理工具']),
        validDays: Random.pick([7, 14, 30, 365, 730]),
        maxUsers: Random.pick([5, 10, 50, 100, 500, 1000]),
        features: ['数据导出', '报表生成', '权限管理', 'API接口', '数据分析', '实时监控', '自定义报表'],
        restrictions: {
          allowExport: Random.boolean(),
          allowAPI: Random.boolean(),
          allowCustomReport: Random.boolean(),
          maxDataSize: Random.pick(['1GB', '5GB', '10GB', '不限'])
        },
        description: Random.csentence(10, 50),
        createUser: Random.cname(),
        createTime: Random.datetime('yyyy-MM-dd HH:mm:ss'),
        updateTime: Random.datetime('yyyy-MM-dd HH:mm:ss')
      }
    }
  })

  // Create license template
  Mock.mock(/\/api\/license-template\/create/, 'post', () => {
    return {
      code: 200,
      message: 'success',
      data: {
        id: Random.increment(1000),
        templateCode: 'TPL' + String(Random.integer(1000, 9999))
      }
    }
  })

  // Update license template
  Mock.mock(/\/api\/license-template\/update/, 'put', () => {
    return {
      code: 200,
      message: 'success',
      data: null
    }
  })

  // Delete license template
  Mock.mock(/\/api\/license-template\/delete/, 'delete', () => {
    return {
      code: 200,
      message: 'success',
      data: null
    }
  })

  // Generate license key
  Mock.mock(/\/api\/license-template\/generate-key/, 'post', () => {
    return {
      code: 200,
      message: 'success',
      data: {
        licenseKey: 'LIC-' + Random.string('upper', 4) + '-' + Random.string('upper', 4) + '-' + Random.string('upper', 4) + '-' + Random.string('upper', 4)
      }
    }
  })
}
