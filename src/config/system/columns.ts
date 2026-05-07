import type { ColumnConfig } from '@/components/DataTable/types'

/**
 * 用户管理表格列配置
 * 所属页面：src/views/system/UserManagement.vue
 */
export const userColumns: ColumnConfig[] = [
  {
    key: 'name', // 列唯一标识
    label: '姓名', // 列显示名称
    prop: 'name', // 数据字段名
    minWidth: '100', // 最小宽度
    visible: true // 是否默认显示
  },
  {
    key: 'username',
    label: '用户名',
    prop: 'username',
    minWidth: '120',
    visible: true
  },
  {
    key: 'phone',
    label: '手机号',
    prop: 'phone',
    minWidth: '130',
    visible: true
  },
  {
    key: 'email',
    label: '邮箱',
    prop: 'email',
    minWidth: '180',
    visible: true,
    showOverflowTooltip: true // 显示溢出提示
  },
  {
    key: 'createTime',
    label: '创建时间',
    prop: 'createTime',
    minWidth: '170',
    visible: true
  },
  {
    key: 'status',
    label: '状态',
    prop: 'status',
    width: '90', // 固定宽度
    visible: true,
    hasTemplate: true // 是否使用自定义模板
  }
]

/**
 * 部门管理表格列配置
 * 所属页面：src/views/system/DepartmentManagement.vue
 */
export const departmentColumns: ColumnConfig[] = [
  {
    key: 'name', // 列唯一标识
    label: '部门名称', // 列显示名称
    prop: 'name', // 数据字段名
    minWidth: '180', // 最小宽度
    visible: true // 是否默认显示
  },
  {
    key: 'sort',
    label: '部门排序',
    prop: 'sort',
    width: '100', // 固定宽度
    visible: true
  },
  {
    key: 'createTime',
    label: '创建时间',
    prop: 'createTime',
    minWidth: '180',
    visible: true
  },
  {
    key: 'status',
    label: '部门状态',
    prop: 'status',
    width: '110', // 固定宽度
    visible: true,
    hasTemplate: true // 是否使用自定义模板
  },
  {
    key: 'remarks',
    label: '部门备注',
    prop: 'remarks',
    minWidth: '180',
    visible: true,
    showOverflowTooltip: true // 显示溢出提示
  }
]

/**
 * 角色管理表格列配置
 * 所属页面：src/views/system/RoleManagement.vue
 */
export const roleColumns: ColumnConfig[] = [
  {
    key: 'name', // 列唯一标识
    label: '角色名称', // 列显示名称
    prop: 'name', // 数据字段名
    minWidth: '140', // 最小宽度
    visible: true // 是否默认显示
  },
  {
    key: 'status',
    label: '状态',
    prop: 'status',
    width: '90', // 固定宽度
    visible: true,
    hasTemplate: true // 是否使用自定义模板
  },
  {
    key: 'sort',
    label: '排序',
    prop: 'sort',
    width: '140', // 固定宽度
    visible: true
  },
  {
    key: 'description',
    label: '描述',
    prop: 'description',
    minWidth: '260',
    visible: true,
    showOverflowTooltip: true // 显示溢出提示
  },
  {
    key: 'createTime',
    label: '创建时间',
    prop: 'createTime',
    minWidth: '170',
    visible: true
  }
]
