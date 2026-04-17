import Mock from 'mockjs'

const Random = Mock.Random

export function setupDepartmentMock() {
  // Department list
  Mock.mock(/\/api\/department\/list/, 'get', (options: any) => {
    const { url } = options
    console.log(options)
    const params = new URLSearchParams(url.split('?')[1])
    const page = parseInt(params.get('page') || '1')
    const pageSize = parseInt(params.get('pageSize') || '20')
    
    const list = []
    for (let i = 0; i < pageSize; i++) {
      list.push({
        id: (page - 1) * pageSize + i + 1,
        name: Random.pick(['华东分部', '华南分部', '华北分部', '西部大区', '总部']) + '-' + Random.pick(['研发部', '技术部', '财务部', '市场部', '人力资源部', '产品部', '测试部']),
        code: 'DEPT' + String(Random.integer(100, 999)),
        parentName: Random.pick(['华东分部', '华南分部', '华北分部', '总部', '-']),
        sortOrder: Random.integer(1, 100),
        status: Random.pick(['启用', '禁用']),
        manager: Random.cname(),
        phone: /^1[3-9]\d{9}$/,
        createUser: Random.cname(),
        createTime: Random.datetime('yyyy-MM-dd HH:mm:ss'),
        updateTime: Random.datetime('yyyy-MM-dd HH:mm:ss'),
        userCount: Random.integer(5, 50)
      })
    }
    
    return {
      code: 200,
      message: 'success',
      data: {
        list,
        total: 60
      }
    }
  })

  // Department tree
  Mock.mock(/\/api\/department\/tree/, 'get', () => {
    return {
      code: 200,
      message: 'success',
      data: [
        {
          id: 1,
          name: '总部',
          code: 'DEPT001',
          sortOrder: 1,
          status: '启用',
          manager: '张三',
          phone: '13800138000',
          userCount: 25,
          remarks: '公司总部',
          children: [
            { id: 11, name: '人力资源部', code: 'DEPT002', sortOrder: 1, status: '启用', manager: '李四', phone: '13800138001', userCount: 8, remarks: '负责招聘、培训等人力资源工作' },
            { id: 12, name: '财务部', code: 'DEPT003', sortOrder: 2, status: '启用', manager: '王五', phone: '13800138002', userCount: 6, remarks: '负责财务核算、报表等工作' },
            { id: 13, name: '行政部', code: 'DEPT004', sortOrder: 3, status: '启用', manager: '赵六', phone: '13800138003', userCount: 4, remarks: '负责公司行政事务、后勤保障等工作' }
          ]
        },
        {
          id: 2,
          name: '华东分部',
          code: 'DEPT010',
          sortOrder: 2,
          status: '启用',
          manager: '钱七',
          phone: '13800138010',
          userCount: 45,
          remarks: '华东地区业务分部',
          children: [
            { id: 21, name: '研发部', code: 'DEPT011', sortOrder: 1, status: '启用', manager: '孙八', phone: '13800138011', userCount: 20, remarks: '负责产品研发、技术创新等工作' },
            { id: 22, name: '技术部', code: 'DEPT012', sortOrder: 2, status: '启用', manager: '周九', phone: '13800138012', userCount: 15, remarks: '负责技术支持、系统维护等工作' },
            { id: 23, name: '产品部', code: 'DEPT013', sortOrder: 3, status: '启用', manager: '吴十', phone: '13800138013', userCount: 10, remarks: '负责产品规划、设计等工作' }
          ]
        },
        {
          id: 3,
          name: '华南分部',
          code: 'DEPT020',
          sortOrder: 3,
          status: '启用',
          manager: '郑一',
          phone: '13800138020',
          userCount: 35,
          remarks: '华南地区业务分部',
          children: [
            { id: 31, name: '研发部', code: 'DEPT021', sortOrder: 1, status: '启用', manager: '冯二', phone: '13800138021', userCount: 18, remarks: '负责产品研发、技术创新等工作' },
            { id: 32, name: '市场部', code: 'DEPT022', sortOrder: 2, status: '启用', manager: '陈三', phone: '13800138022', userCount: 12, remarks: '负责市场推广、客户开发等工作' }
          ]
        },
        {
          id: 4,
          name: '华北分部',
          code: 'DEPT030',
          sortOrder: 4,
          status: '启用',
          manager: '褚四',
          phone: '13800138030',
          userCount: 30,
          remarks: '华北地区业务分部',
          children: [
            { id: 41, name: '研发部', code: 'DEPT031', sortOrder: 1, status: '启用', manager: '卫五', phone: '13800138031', userCount: 15, remarks: '负责产品研发、技术创新等工作' },
            { id: 42, name: '测试部', code: 'DEPT032', sortOrder: 2, status: '启用', manager: '蒋六', phone: '13800138032', userCount: 10, remarks: '负责产品测试、质量保证等工作' }
          ]
        }
      ]
    }
  })

  // Get department detail
  Mock.mock(/\/api\/department\/detail/, 'get', () => {
    return {
      code: 200,
      message: 'success',
      data: {
        id: Random.increment(1000),
        name: Random.pick(['华东分部-研发部', '华南分部-技术部']),
        code: 'DEPT' + String(Random.integer(100, 999)),
        parentId: Random.increment(100),
        sortOrder: Random.integer(1, 100),
        status: Random.pick(['启用', '禁用']),
        manager: Random.cname(),
        phone: /^1[3-9]\d{9}$/,
        email: Random.email(),
        address: Random.cities() + Random.county() + Random.ctitle(5, 10) + '号',
        description: Random.csentence(10, 50),
        createUser: Random.cname(),
        createTime: Random.datetime('yyyy-MM-dd HH:mm:ss'),
        updateTime: Random.datetime('yyyy-MM-dd HH:mm:ss')
      }
    }
  })

  // Create department
  Mock.mock(/\/api\/department\/create/, 'post', () => {
    return {
      code: 200,
      message: 'success',
      data: {
        id: Random.increment(1000)
      }
    }
  })

  // Update department
  Mock.mock(/\/api\/department\/update/, 'put', () => {
    return {
      code: 200,
      message: 'success',
      data: null
    }
  })

  // Delete department
  Mock.mock(/\/api\/department\/delete/, 'delete', () => {
    return {
      code: 200,
      message: 'success',
      data: null
    }
  })
}
