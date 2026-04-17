import Mock from 'mockjs'

const Random = Mock.Random

export function setupCustomerMock() {
  // Customer list
  Mock.mock(/\/api\/customer\/list/, 'get', (options: any) => {
    const { url } = options
    const params = new URLSearchParams(url.split('?')[1])
    const page = parseInt(params.get('page') || '1')
    const pageSize = parseInt(params.get('pageSize') || '20')
    
    const customerLevels = ['重要客户', '普通客户', '潜在客户', '流失客户']
    const customerSources = ['官网', '推荐', '展会', '电话营销', '网络推广']
    const industries = ['互联网', '金融', '制造', '教育', '医疗', '零售', '物流', '政府']
    
    const list = []
    for (let i = 0; i < pageSize; i++) {
      list.push({
        id: (page - 1) * pageSize + i + 1,
        customerCode: 'CUST' + String(Random.integer(10000, 99999)),
        name: Random.cname() + Random.pick(['科技有限公司', '信息技术有限公司', '网络技术有限公司', '软件科技有限公司', '数据科技有限公司']),
        contact: Random.cname(),
        phone: /^1[3-9]\d{9}$/,
        contactEmail: Random.email(),
        industry: Random.pick(industries),
        customerLevel: Random.pick(customerLevels),
        accountStatus: Random.pick(['正常', '禁用', '过期']),
        source: Random.pick(customerSources),
        province: Random.province(),
        city: Random.city(),
        address: Random.county() + Random.csentence(5, 15) + '号',
        salesPerson: Random.cname(),
        contractCount: Random.integer(0, 10),
        totalAmount: Random.integer(10000, 1000000),
        lastCooperationDate: Random.date('yyyy-MM-dd'),
        createDate: Random.datetime('yyyy-MM-dd HH:mm:ss'),
        updateTime: Random.datetime('yyyy-MM-dd HH:mm:ss'),
        remark: Random.csentence(10, 30)
      })
    }
    
    return {
      code: 200,
      message: 'success',
      data: {
        list,
        total: 180
      }
    }
  })

  // Get customer detail
  Mock.mock(/\/api\/customer\/detail/, 'get', () => {
    return {
      code: 200,
      message: 'success',
      data: {
        id: Random.increment(10000),
        customerCode: 'CUST' + String(Random.integer(10000, 99999)),
        customerName: Random.cname() + Random.pick(['科技有限公司', '信息技术有限公司']),
        contactPerson: Random.cname(),
        contactPhone: /^1[3-9]\d{9}$/,
        contactEmail: Random.email(),
        industry: Random.pick(['互联网', '金融', '制造', '教育', '医疗']),
        customerLevel: Random.pick(['重要客户', '普通客户', '潜在客户']),
        customerStatus: Random.pick(['合作中', '已到期', '未合作']),
        source: Random.pick(['官网', '推荐', '展会', '电话营销']),
        province: Random.province(),
        city: Random.city(),
        address: Random.county() + Random.csentence(5, 15) + '号',
        website: 'www.' + Random.domain() + '.com',
        employeeCount: Random.pick([50, 100, 200, 500, 1000]),
        annualRevenue: Random.pick(['100万-500万', '500万-1000万', '1000万-5000万', '5000万以上']),
        salesPerson: Random.cname(),
        salesDepartment: Random.pick(['华东销售部', '华南销售部', '华北销售部']),
        contractCount: Random.integer(0, 10),
        totalAmount: Random.integer(10000, 1000000),
        lastCooperationDate: Random.date('yyyy-MM-dd'),
        createTime: Random.datetime('yyyy-MM-dd HH:mm:ss'),
        updateTime: Random.datetime('yyyy-MM-dd HH:mm:ss'),
        remark: Random.csentence(10, 30)
      }
    }
  })

  // Create customer
  Mock.mock(/\/api\/customer\/create/, 'post', () => {
    return {
      code: 200,
      message: 'success',
      data: {
        id: Random.increment(10000),
        customerCode: 'CUST' + String(Random.integer(10000, 99999))
      }
    }
  })

  // Update customer
  Mock.mock(/\/api\/customer\/update/, 'put', () => {
    return {
      code: 200,
      message: 'success',
      data: null
    }
  })

  // Delete customer
  Mock.mock(/\/api\/customer\/delete/, 'delete', () => {
    return {
      code: 200,
      message: 'success',
      data: null
    }
  })

  // Export customers
  Mock.mock(/\/api\/customer\/export/, 'post', () => {
    return {
      code: 200,
      message: '导出成功',
      data: {
        downloadUrl: '/api/files/customers_export_' + Random.date('yyyyMMdd') + '.xlsx'
      }
    }
  })
}
