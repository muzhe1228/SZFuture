import Mock from 'mockjs'

const Random = Mock.Random

export function setupApprovalMock() {
  // Approval list
  Mock.mock(/\/api\/approval\/list/, 'get', (options: any) => {
    const { url } = options
    const params = new URLSearchParams(url.split('?')[1])
    const page = parseInt(params.get('page') || '1')
    const pageSize = parseInt(params.get('pageSize') || '20')
    

    
    const list = []
    for (let i = 0; i < pageSize; i++) {
      list.push({
        id: (page - 1) * pageSize + i + 1,
        item: Random.pick(['授权激活', '授权冻结', '授权解冻', '授权延期', '授权作废']),
        authNo: 'AUTH' + String(Random.integer(100000, 999999)),
        customerName: Random.cname() + Random.pick(['科技有限公司', '信息技术有限公司', '网络技术有限公司']),
        operator: Random.pick(['张三', '李四', '王五', '赵六', '钱七', '孙八']),
        operateTime: Random.datetime('yyyy-MM-dd HH:mm:ss'),
        status: Random.pick(['待审核', '已通过', '已拒绝']),
        reason: Random.csentence(10, 30),
        authInfo: {
          customerName: Random.cname() + Random.pick(['科技有限公司', '信息技术有限公司']),
          productModule: Random.pick(['数据分析平台', '智能报表系统', '项目管理工具', '客户管理系统']),
          subscribeFunction: Random.pick(['数据导出', '报表生成', '权限管理', 'API接口']),
          authType: Random.pick(['试用版', '标准版', '专业版', '企业版']),
          orderNo: 'ORD' + Random.date('yyyyMMdd') + String(Random.integer(1000, 9999)),
          authNo: 'AUTH' + String(Random.integer(100000, 999999)),
          hardwareBind: Random.pick(['已绑定', '未绑定']),
          bindDate: Random.date('yyyy-MM-dd'),
          authStartDate: Random.date('yyyy-MM-dd'),
          authEndDate: Random.date('yyyy-MM-dd')
        },
        records: [
          {
            operator: '系统',
            action: '提交审批',
            time: Random.datetime('yyyy-MM-dd HH:mm:ss'),
            type: 'info',
            color: '#909399'
          }
        ]
      })
    }
    
    return {
      code: 200,
      message: 'success',
      data: {
        list,
        total: 75,
        pendingCount: Random.integer(5, 20)
      }
    }
  })

  // Get approval detail
  Mock.mock(/\/api\/approval\/detail/, 'get', () => {
    return {
      code: 200,
      message: 'success',
      data: {
        id: Random.increment(10000),
        approvalNo: 'APPR' + Random.date('yyyyMMdd') + String(Random.integer(1000, 9999)),
        approvalType: Random.pick(['试用申请', '订单审批', '授权审批', '退款审批', '折扣申请']),
        title: Random.pick(['客户试用申请审批', '大额订单折扣审批', '产品授权审批']),
        applicant: Random.cname(),
        applicantId: Random.increment(1000),
        applicantDepartment: Random.pick(['华东销售部', '华南销售部', '技术部']),
        applicantPhone: /^1[3-9]\d{9}$/,
        applicantEmail: Random.email(),
        approvalLevel: Random.pick(['一级审批', '二级审批', '三级审批']),
        approvalStatus: Random.pick(['待审批', '审批中', '已通过', '已拒绝']),
        currentApprover: Random.cname(),
        priority: Random.pick(['普通', '紧急', '特急']),
        amount: Random.integer(1000, 100000),
        customerName: Random.cname() + Random.pick(['科技有限公司', '信息技术有限公司']),
        customerId: Random.increment(1000),
        productName: Random.pick(['数据分析平台', '智能报表系统', '项目管理工具']),
        description: Random.cparagraph(2, 4),
        attachments: [
          {
            name: Random.ctitle(3, 5) + '.pdf',
            size: Random.integer(100, 5000) + 'KB',
            url: '/api/files/' + Random.guid()
          }
        ],
        approvalFlow: [
          {
            step: 1,
            approver: Random.cname(),
            role: '部门经理',
            status: '已通过',
            comment: '同意申请',
            approvalTime: Random.datetime('yyyy-MM-dd HH:mm:ss')
          },
          {
            step: 2,
            approver: Random.cname(),
            role: '技术总监',
            status: Random.pick(['待审批', '已通过', '已拒绝']),
            comment: Random.pick(['-', '同意', '需要补充材料']),
            approvalTime: Random.pick(['-', Random.datetime('yyyy-MM-dd HH:mm:ss')])
          },
          {
            step: 3,
            approver: Random.cname(),
            role: '总经理',
            status: '待审批',
            comment: '-',
            approvalTime: '-'
          }
        ],
        createTime: Random.datetime('yyyy-MM-dd HH:mm:ss'),
        updateTime: Random.datetime('yyyy-MM-dd HH:mm:ss'),
        remark: Random.csentence(5, 20)
      }
    }
  })

  // Approve
  Mock.mock(/\/api\/approval\/approve/, 'post', () => {
    return {
      code: 200,
      message: '审批通过',
      data: null
    }
  })

  // Reject
  Mock.mock(/\/api\/approval\/reject/, 'post', () => {
    return {
      code: 200,
      message: '已拒绝',
      data: null
    }
  })

  // Withdraw
  Mock.mock(/\/api\/approval\/withdraw/, 'post', () => {
    return {
      code: 200,
      message: '已撤回',
      data: null
    }
  })

  // Create approval
  Mock.mock(/\/api\/approval\/create/, 'post', () => {
    return {
      code: 200,
      message: '提交成功',
      data: {
        id: Random.increment(10000),
        approvalNo: 'APPR' + Random.date('yyyyMMdd') + String(Random.integer(1000, 9999))
      }
    }
  })

  // Get pending count
  Mock.mock(/\/api\/approval\/pending-count/, 'get', () => {
    return {
      code: 200,
      message: 'success',
      data: {
        total: Random.integer(5, 30),
        trial: Random.integer(1, 10),
        order: Random.integer(1, 10),
        auth: Random.integer(1, 10),
        refund: Random.integer(0, 5),
        discount: Random.integer(0, 5)
      }
    }
  })
}
