import Mock from 'mockjs'

const Random = Mock.Random

export function setupUserMock() {
  // User list
  Mock.mock(/\/api\/user\/list/, 'get', (options: any) => {
    const { url } = options
    const params = new URLSearchParams(url.split('?')[1])
    const page = parseInt(params.get('page') || '1')
    const pageSize = parseInt(params.get('pageSize') || '20')

    const list = []
    for (let i = 0; i < pageSize; i++) {
      const id = (page - 1) * pageSize + i + 1
      list.push({
        id,
        name: Random.cname(),
        username: Random.first().toLowerCase() + Random.last().toLowerCase(),
        phone: '1' + Random.string('number',10),
        email: Random.email('qq.com'),
        createTime: Random.datetime('yyyy-MM-dd HH:mm:ss'),
        updateTime: Random.datetime('yyyy-MM-dd HH:mm:ss'),
        status: Random.pick(['启用', '禁用']),
        department: Random.pick(['华东分部-研发部', '华东分部-技术部', '华南分部-财务部', '华北分部-市场部', '总部-人力资源部']),
        gender: Random.pick(['男', '女', '保密']),
        position: Random.pick(['高级工程师', '产品经理', '设计师', '测试工程师', '项目经理', '技术总监'])
      })
    }
    
    return {
      code: 200,
      message: 'success',
      data: {
        list,
        total: 100
      }
    }
  })

  // Get user detail
  Mock.mock(/\/api\/user\/detail/, 'get', () => {
    return {
      code: 200,
      message: 'success',
      data: {
        id: Random.increment(10000),
        name: Random.cname(),
        username: Random.first().toLowerCase() + Random.last().toLowerCase(),
        phone: /^1[3-9]\d{9}$/,
        email: Random.email('qq.com'),
        createTime: Random.datetime('yyyy-MM-dd HH:mm:ss'),
        updateTime: Random.datetime('yyyy-MM-dd HH:mm:ss'),
        status: Random.pick(['启用', '禁用']),
        department: Random.pick(['华东分部-研发部', '华东分部-技术部', '华南分部-财务部']),
        gender: Random.pick(['男', '女', '保密']),
        position: Random.pick(['高级工程师', '产品经理', '设计师', '测试工程师']),
        avatar: Random.image('100x100', '#409EFF', 'Avatar'),
        remark: Random.csentence(10, 30)
      }
    }
  })

  // Create user
  Mock.mock(/\/api\/user\/create/, 'post', () => {
    return {
      code: 200,
      message: 'success',
      data: {
        id: Random.increment(10000)
      }
    }
  })

  // Update user
  Mock.mock(/\/api\/user\/update/, 'put', () => {
    return {
      code: 200,
      message: 'success',
      data: null
    }
  })

  // Delete user
  Mock.mock(/\/api\/user\/delete/, 'delete', () => {
    return {
      code: 200,
      message: 'success',
      data: null
    }
  })

  // Batch delete users
  Mock.mock(/\/api\/user\/batch-delete/, 'post', () => {
    return {
      code: 200,
      message: 'success',
      data: null
    }
  })

  // Reset password
  Mock.mock(/\/api\/user\/reset-password/, 'post', () => {
    return {
      code: 200,
      message: '密码重置成功',
      data: {
        password: '123456'
      }
    }
  })
}
