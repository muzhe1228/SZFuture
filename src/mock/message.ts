import Mock from 'mockjs'

const Random = Mock.Random

export function setupMessageMock() {
  // Message list
  Mock.mock(/\/api\/message\/list/, 'get', (options: any) => {
    const { url } = options
    const params = new URLSearchParams(url.split('?')[1])
    const page = parseInt(params.get('page') || '1')
    const pageSize = parseInt(params.get('pageSize') || '20')
    
    const messageTypes = ['系统通知', '订单通知', '授权通知', '审批通知', '系统公告']
    const messagePriorities = ['普通', '重要', '紧急']
    
    const list = []
    for (let i = 0; i < pageSize; i++) {
      list.push({
        id: (page - 1) * pageSize + i + 1,
        title: Random.cname() + Random.pick(['科技有限公司', '信息技术有限公司', '网络技术有限公司']),
        phone: '1' + Random.pick(['3', '5', '6', '7', '8', '9']) + Random.string('number', 9),
        type: Random.pick(messageTypes),
        priority: Random.pick(messagePriorities),
        content: Random.cparagraph(2, 4),
        sender: Random.pick(['系统', '管理员', Random.cname()]),
        receiver: Random.cname(),
        status: Random.pick(['未处理', '已处理']),
        startDate: Random.date('yyyy-MM-dd HH:mm:ss'),
        endDate: Random.date('yyyy-MM-dd HH:mm:ss'),
        expiryTime: Random.date('yyyy-MM-dd'),
        isRead: Random.boolean(),
        receiveTime: Random.datetime('yyyy-MM-dd HH:mm:ss'),
        customerName: Random.cname() + Random.pick(['科技有限公司', '信息技术有限公司'])
      })
    }
    
    return {
      code: 200,
      message: 'success',
      data: {
        list,
        total: 120,
        unreadCount: Random.integer(5, 30)
      }
    }
  })

  // Get message detail
  Mock.mock(/\/api\/message\/detail/, 'get', () => {
    return {
      code: 200,
      message: 'success',
      data: {
        id: Random.increment(10000),
        title: Random.pick(['订单支付成功通知', '试用申请审批结果', '系统升级通知', '授权到期提醒']),
        type: Random.pick(['系统通知', '订单通知', '授权通知', '审批通知', '系统公告']),
        priority: Random.pick(['普通', '重要', '紧急']),
        content: Random.cparagraph(3, 6),
        sender: Random.pick(['系统', '管理员', Random.cname()]),
        senderId: Random.increment(1000),
        receiver: Random.cname(),
        receiverId: Random.increment(1000),
        status: Random.pick(['未读', '已读']),
        createTime: Random.datetime('yyyy-MM-dd HH:mm:ss'),
        readTime: Random.datetime('yyyy-MM-dd HH:mm:ss'),
        isRead: Random.boolean(),
        attachment: Random.boolean() ? {
          name: Random.ctitle(3, 5) + '.pdf',
          size: Random.integer(100, 5000) + 'KB',
          url: '/api/files/' + Random.guid()
        } : null
      }
    }
  })

  // Mark as read
  Mock.mock(/\/api\/message\/read/, 'post', () => {
    return {
      code: 200,
      message: 'success',
      data: null
    }
  })

  // Batch mark as read
  Mock.mock(/\/api\/message\/batch-read/, 'post', () => {
    return {
      code: 200,
      message: 'success',
      data: null
    }
  })

  // Mark all as read
  Mock.mock(/\/api\/message\/read-all/, 'post', () => {
    return {
      code: 200,
      message: '全部标记为已读',
      data: null
    }
  })

  // Delete message
  Mock.mock(/\/api\/message\/delete/, 'delete', () => {
    return {
      code: 200,
      message: 'success',
      data: null
    }
  })

  // Batch delete messages
  Mock.mock(/\/api\/message\/batch-delete/, 'post', () => {
    return {
      code: 200,
      message: 'success',
      data: null
    }
  })

  // Get unread count
  Mock.mock(/\/api\/message\/unread-count/, 'get', () => {
    return {
      code: 200,
      message: 'success',
      data: {
        total: Random.integer(5, 50),
        systemNotice: Random.integer(1, 10),
        orderNotice: Random.integer(1, 10),
        authNotice: Random.integer(1, 10),
        approvalNotice: Random.integer(1, 10),
        announcement: Random.integer(1, 10)
      }
    }
  })

  // Send message
  Mock.mock(/\/api\/message\/send/, 'post', () => {
    return {
      code: 200,
      message: '发送成功',
      data: {
        id: Random.increment(10000)
      }
    }
  })
}
