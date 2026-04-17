import Mock from 'mockjs'

const Random = Mock.Random

export function setupRoleMock() {
  // Role list
  Mock.mock(/\/api\/role\/list/, 'get', (options: any) => {
    const { url } = options
    const params = new URLSearchParams(url.split('?')[1])
    const page = parseInt(params.get('page') || '1')
    const pageSize = parseInt(params.get('pageSize') || '20')
    
    const list = []
    const roleNames = ['超级管理员', '系统管理员', '研发主管', '产品经理', '项目经理', '技术专家', '普通员工', '访客']
    const roleCodes = ['super_admin', 'admin', 'dev_lead', 'pm', 'project_mgr', 'tech_expert', 'employee', 'guest']
    
    for (let i = 0; i < pageSize; i++) {
      const index = i % roleNames.length
      list.push({
        id: (page - 1) * pageSize + i + 1,
        name: roleNames[index],
        code: roleCodes[index],
        description: Random.csentence(10, 30),
        status: Random.pick(['启用', '禁用']),
        createUser: Random.cname(),
        createTime: Random.datetime('yyyy-MM-dd HH:mm:ss'),
        updateTime: Random.datetime('yyyy-MM-dd HH:mm:ss'),
        userCount: Random.integer(0, 100)
      })
    }
    
    return {
      code: 200,
      message: 'success',
      data: {
        list,
        total: roleNames.length
      }
    }
  })

  // Get role detail
  Mock.mock(/\/api\/role\/detail/, 'get', () => {
    return {
      code: 200,
      message: 'success',
      data: {
        id: Random.increment(1000),
        name: Random.pick(['超级管理员', '系统管理员', '研发主管', '产品经理']),
        code: Random.pick(['super_admin', 'admin', 'dev_lead', 'pm']),
        description: Random.csentence(10, 30),
        status: Random.pick(['启用', '禁用']),
        createUser: Random.cname(),
        createTime: Random.datetime('yyyy-MM-dd HH:mm:ss'),
        updateTime: Random.datetime('yyyy-MM-dd HH:mm:ss'),
        permissions: [
          { id: 1, name: '用户管理', code: 'user', children: [
            { id: 11, name: '查看用户', code: 'user:view' },
            { id: 12, name: '创建用户', code: 'user:create' },
            { id: 13, name: '编辑用户', code: 'user:update' },
            { id: 14, name: '删除用户', code: 'user:delete' }
          ]},
          { id: 2, name: '角色管理', code: 'role', children: [
            { id: 21, name: '查看角色', code: 'role:view' },
            { id: 22, name: '创建角色', code: 'role:create' },
            { id: 23, name: '编辑角色', code: 'role:update' },
            { id: 24, name: '删除角色', code: 'role:delete' }
          ]}
        ]
      }
    }
  })

  // Create role
  Mock.mock(/\/api\/role\/create/, 'post', () => {
    return {
      code: 200,
      message: 'success',
      data: {
        id: Random.increment(1000)
      }
    }
  })

  // Update role
  Mock.mock(/\/api\/role\/update/, 'put', () => {
    return {
      code: 200,
      message: 'success',
      data: null
    }
  })

  // Delete role
  Mock.mock(/\/api\/role\/delete/, 'delete', () => {
    return {
      code: 200,
      message: 'success',
      data: null
    }
  })

  // Get permission tree
  Mock.mock(/\/api\/role\/permissions/, 'get', () => {
    return {
      code: 200,
      message: 'success',
      data: [
        {
          id: 1,
          name: '系统管理',
          code: 'system',
          type: 'menu',
          children: [
            { id: 11, name: '用户管理', code: 'system:user', type: 'menu', children: [
              { id: 111, name: '查看用户', code: 'system:user:view', type: 'button' },
              { id: 112, name: '创建用户', code: 'system:user:create', type: 'button' },
              { id: 113, name: '编辑用户', code: 'system:user:update', type: 'button' },
              { id: 114, name: '删除用户', code: 'system:user:delete', type: 'button' }
            ]},
            { id: 12, name: '角色管理', code: 'system:role', type: 'menu', children: [
              { id: 121, name: '查看角色', code: 'system:role:view', type: 'button' },
              { id: 122, name: '创建角色', code: 'system:role:create', type: 'button' },
              { id: 123, name: '编辑角色', code: 'system:role:update', type: 'button' },
              { id: 124, name: '删除角色', code: 'system:role:delete', type: 'button' }
            ]},
            { id: 13, name: '部门管理', code: 'system:dept', type: 'menu', children: [
              { id: 131, name: '查看部门', code: 'system:dept:view', type: 'button' },
              { id: 132, name: '创建部门', code: 'system:dept:create', type: 'button' },
              { id: 133, name: '编辑部门', code: 'system:dept:update', type: 'button' },
              { id: 134, name: '删除部门', code: 'system:dept:delete', type: 'button' }
            ]}
          ]
        },
        {
          id: 2,
          name: '授权管理',
          code: 'auth',
          type: 'menu',
          children: [
            { id: 21, name: '授权列表', code: 'auth:list', type: 'menu', children: [
              { id: 211, name: '查看授权', code: 'auth:list:view', type: 'button' },
              { id: 212, name: '授权操作', code: 'auth:list:grant', type: 'button' },
              { id: 213, name: '取消授权', code: 'auth:list:revoke', type: 'button' }
            ]}
          ]
        },
        {
          id: 3,
          name: '订单管理',
          code: 'order',
          type: 'menu',
          children: [
            { id: 31, name: '订单列表', code: 'order:list', type: 'menu', children: [
              { id: 311, name: '查看订单', code: 'order:list:view', type: 'button' },
              { id: 312, name: '创建订单', code: 'order:list:create', type: 'button' }
            ]}
          ]
        },
        {
          id: 4,
          name: '客户管理',
          code: 'customer',
          type: 'menu',
          children: [
            { id: 41, name: '客户列表', code: 'customer:list', type: 'menu', children: [
              { id: 411, name: '查看客户', code: 'customer:list:view', type: 'button' },
              { id: 412, name: '创建客户', code: 'customer:list:create', type: 'button' },
              { id: 413, name: '编辑客户', code: 'customer:list:update', type: 'button' }
            ]}
          ]
        }
      ]
    }
  })
}
