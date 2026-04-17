import Mock from 'mockjs'

const Random = Mock.Random

export function setupOrderMock() {
  // Order list
  Mock.mock(/\/api\/order\/list/, 'get', (options: any) => {
    const { url } = options
    const params = new URLSearchParams(url.split('?')[1])
    const page = parseInt(params.get('page') || '1')
    const pageSize = parseInt(params.get('pageSize') || '20')
    
    const orderTypes = ['新购', '续费', '增购', '升级']
    const orderStatus = ['待支付', '已支付', '已取消', '已退款']
    const paymentMethods = ['支付宝', '微信支付', '银行转账', '对公转账']
    const productNames = ['数据分析平台-专业版', '智能报表系统-企业版', '项目管理工具-标准版', '客户管理系统-专业版', '财务管理系统-企业版']
    
    const list = []
    for (let i = 0; i < pageSize; i++) {
      const orderNo = 'ORD' + Random.date('yyyyMMdd') + String(Random.integer(1000, 9999))
      list.push({
        id: (page - 1) * pageSize + i + 1,
        orderNo,
        customerName: Random.cname() + Random.pick(['科技有限公司', '信息技术有限公司', '网络技术有限公司', '软件科技有限公司']),
        productName: Random.pick(productNames),
        orderType: Random.pick(orderTypes),
        orderStatus: Random.pick(orderStatus),
        amount: Random.integer(1000, 100000),
        paidAmount: Random.integer(1000, 100000),
        paymentMethod: Random.pick(paymentMethods),
        authStartDate: Random.date('yyyy-MM-dd'),
        authEndDate: Random.date('yyyy-MM-dd'),
        authCount: Random.pick([10, 50, 100, 200, 500]),
        salesPerson: Random.cname(),
        createTime: Random.datetime('yyyy-MM-dd HH:mm:ss'),
        updateTime: Random.datetime('yyyy-MM-dd HH:mm:ss'),
        payTime: Random.datetime('yyyy-MM-dd HH:mm:ss'),
        remark: Random.csentence(10, 30)
      })
    }
    
    return {
      code: 200,
      message: 'success',
      data: {
        list,
        total: 200
      }
    }
  })

  // Get order detail
  Mock.mock(/\/api\/order\/detail/, 'get', () => {
    return {
      code: 200,
      message: 'success',
      data: {
        id: Random.increment(10000),
        orderNo: 'ORD' + Random.date('yyyyMMdd') + String(Random.integer(1000, 9999)),
        customerId: Random.increment(10000),
        customerName: Random.cname() + Random.pick(['科技有限公司', '信息技术有限公司']),
        customerPhone: /^1[3-9]\d{9}$/,
        customerEmail: Random.email(),
        productId: Random.increment(1000),
        productName: Random.pick(['数据分析平台', '智能报表系统', '项目管理工具']),
        productVersion: Random.pick(['标准版', '专业版', '企业版']),
        orderType: Random.pick(['新购', '续费', '增购', '升级']),
        orderStatus: Random.pick(['待支付', '已支付', '已取消', '已退款']),
        amount: Random.integer(1000, 100000),
        discountAmount: Random.integer(100, 5000),
        paidAmount: Random.integer(1000, 100000),
        paymentMethod: Random.pick(['支付宝', '微信支付', '银行转账', '对公转账']),
        paymentNo: 'PAY' + String(Random.integer(100000, 999999)),
        startDate: Random.date('yyyy-MM-dd'),
        endDate: Random.date('yyyy-MM-dd'),
        licenseCount: Random.pick([10, 50, 100, 200, 500]),
        salesPerson: Random.cname(),
        salesDepartment: Random.pick(['华东销售部', '华南销售部', '华北销售部']),
        createTime: Random.datetime('yyyy-MM-dd HH:mm:ss'),
        updateTime: Random.datetime('yyyy-MM-dd HH:mm:ss'),
        payTime: Random.datetime('yyyy-MM-dd HH:mm:ss'),
        invoiceStatus: Random.pick(['未开票', '已开票', '已寄出']),
        invoiceNo: 'INV' + String(Random.integer(100000, 999999)),
        remark: Random.csentence(10, 30)
      }
    }
  })

  // Create order
  Mock.mock(/\/api\/order\/create/, 'post', () => {
    return {
      code: 200,
      message: 'success',
      data: {
        id: Random.increment(10000),
        orderNo: 'ORD' + Random.date('yyyyMMdd') + String(Random.integer(1000, 9999))
      }
    }
  })

  // Update order
  Mock.mock(/\/api\/order\/update/, 'put', () => {
    return {
      code: 200,
      message: 'success',
      data: null
    }
  })

  // Cancel order
  Mock.mock(/\/api\/order\/cancel/, 'post', () => {
    return {
      code: 200,
      message: '订单已取消',
      data: null
    }
  })

  // Delete order
  Mock.mock(/\/api\/order\/delete/, 'delete', () => {
    return {
      code: 200,
      message: 'success',
      data: null
    }
  })

  // Export orders
  Mock.mock(/\/api\/order\/export/, 'post', () => {
    return {
      code: 200,
      message: '导出成功',
      data: {
        downloadUrl: '/api/files/orders_export_' + Random.date('yyyyMMdd') + '.xlsx'
      }
    }
  })
}
