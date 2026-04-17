import Mock from 'mockjs'

const Random = Mock.Random

export function setupTrialMock() {
  // Trial list
  Mock.mock(/\/api\/trial\/list/, 'get', (options: any) => {
    const { url } = options
    const params = new URLSearchParams(url.split('?')[1])
    const page = parseInt(params.get('page') || '1')
    const pageSize = parseInt(params.get('pageSize') || '20')
    
    const productNames = ['数据分析平台', '智能报表系统', '项目管理工具', '客户管理系统', '财务管理系统']
    const trialDurations = [7, 14, 30, 60, 90]
    const approvalStatus = ['待审批', '审批通过', '审批拒绝']
    
    const list = []
    for (let i = 0; i < pageSize; i++) {
      list.push({
        id: (page - 1) * pageSize + i + 1,
        trialNo: 'TRIAL' + String(Random.integer(10000, 99999)),
        customerName: Random.cname() + Random.pick(['科技有限公司', '信息技术有限公司', '网络技术有限公司']),
        contactPerson: Random.cname(),
        phone: /^1[3-9]\d{9}$/,
        contactEmail: Random.email(),
        productName: Random.pick(productNames),
        trialDuration: Random.pick(trialDurations),
        bindDate: Random.date('yyyy-MM-dd'),
        authStartDate: Random.date('yyyy-MM-dd'),
        authEndDate: Random.date('yyyy-MM-dd'),
        status: Random.pick(['已激活', '已冻结', '已过期', '已作废']),
        approvalStatus: Random.pick(approvalStatus),
        applicant: Random.cname(),
        approver: Random.pick(['-', Random.cname()]),
        approvalTime: Random.datetime('yyyy-MM-dd HH:mm:ss'),
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
        total: 85
      }
    }
  })

  // Get trial detail
  Mock.mock(/\/api\/trial\/detail/, 'get', () => {
    return {
      code: 200,
      message: 'success',
      data: {
        id: Random.increment(10000),
        trialNo: 'TRIAL' + String(Random.integer(10000, 99999)),
        customerId: Random.increment(10000),
        customerName: Random.cname() + Random.pick(['科技有限公司', '信息技术有限公司']),
        contactPerson: Random.cname(),
        contactPhone: /^1[3-9]\d{9}$/,
        contactEmail: Random.email(),
        companyId: Random.cword(3) + Random.pick(['科技有限公司', '信息技术有限公司']),
        position: Random.pick(['技术总监', 'CTO', '技术经理', '项目经理', '产品经理']),
        productName: Random.pick(['数据分析平台', '智能报表系统', '项目管理工具']),
        productId: Random.increment(1000),
        trialDuration: Random.pick([7, 14, 30, 60, 90]),
        trialStartDate: Random.date('yyyy-MM-dd'),
        trialEndDate: Random.date('yyyy-MM-dd'),
        trialStatus: Random.pick(['申请中', '审批中', '已开通', '已拒绝', '已过期']),
        approvalStatus: Random.pick(['待审批', '审批通过', '审批拒绝']),
        applicant: Random.cname(),
        applicantDepartment: Random.pick(['技术部', '研发部', '产品部']),
        approver: Random.pick(['-', Random.cname()]),
        approvalTime: Random.datetime('yyyy-MM-dd HH:mm:ss'),
        approvalComment: Random.pick(['-', '同意试用', '暂不符合需求', '待进一步沟通']),
        licenseKey: Random.csentence(20, 40),
        maxUsers: Random.pick([5, 10, 20]),
        features: ['基础功能', '数据导出', '报表查看'],
        createTime: Random.datetime('yyyy-MM-dd HH:mm:ss'),
        updateTime: Random.datetime('yyyy-MM-dd HH:mm:ss'),
        remark: Random.csentence(10, 30)
      }
    }
  })

  // Create trial application
  Mock.mock(/\/api\/trial\/apply/, 'post', () => {
    return {
      code: 200,
      message: '申请提交成功',
      data: {
        id: Random.increment(10000),
        trialNo: 'TRIAL' + String(Random.integer(10000, 99999))
      }
    }
  })

  // Approve trial
  Mock.mock(/\/api\/trial\/approve/, 'post', () => {
    return {
      code: 200,
      message: '审批通过',
      data: null
    }
  })

  // Reject trial
  Mock.mock(/\/api\/trial\/reject/, 'post', () => {
    return {
      code: 200,
      message: '已拒绝',
      data: null
    }
  })

  // Update trial
  Mock.mock(/\/api\/trial\/update/, 'put', () => {
    return {
      code: 200,
      message: 'success',
      data: null
    }
  })

  // Delete trial
  Mock.mock(/\/api\/trial\/delete/, 'delete', () => {
    return {
      code: 200,
      message: 'success',
      data: null
    }
  })
}
