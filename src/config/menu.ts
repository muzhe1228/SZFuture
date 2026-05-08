export interface MenuItem {
  index: string
  label: string
  icon?: string
  permission?: string
  children?: MenuItem[]
}

export const menuItems: MenuItem[] = [
  { index: '/dashboard', label: '工作台', icon: 'HomeFilled' },
  { index: '/messages', label: '消息', icon: 'ChatDotRound', permission: 'message:view' },
  {
    index: 'auth',
    label: '授权管理',
    icon: 'Key',
    children: [
      { index: '/auth/trials', label: '试用列表', permission: 'trial:view' },
      { index: '/auth/list', label: '授权列表', permission: 'auth:view' },
      { index: '/auth/orders', label: '订单列表', permission: 'order:view' },
      { index: '/auth/customers', label: '客户列表', permission: 'customer:view' },
    ],
  },
  {
    index: 'product',
    label: '产品管理',
    icon: 'Box',
    permission: 'product:view',
    children: [
      { index: '/product/modules', label: '产品模块配置', permission: 'product:view' },
      { index: '/product/templates', label: '许可模版配置', permission: 'product:view' },
    ],
  },
  {
    index: 'system',
    label: '系统管理',
    icon: 'Setting',
    children: [
      { index: '/system/users', label: '用户管理', permission: 'user:view' },
      { index: '/system/roles', label: '角色管理', permission: 'role:view' },
      { index: '/system/departments', label: '部门管理', permission: 'department:view' },
      { index: '/system/config', label: '系统配置', permission: 'system:config' },
    ],
  },
  {
    index: 'audit',
    label: '运维管理',
    icon: 'Document',
    permission: 'log:view',
    children: [
      { index: '/audit/operations', label: '操作日志', permission: 'log:view' },
      { index: '/audit/system', label: '系统日志', permission: 'log:view' },
    ],
  },
  { index: '/approval/list', label: '审批列表', icon: 'Checked', permission: 'approval:view' },
]
