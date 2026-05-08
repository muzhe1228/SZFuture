import type { SearchField } from '@/components/SearchForm/types'

/**
 * 用户管理搜索字段配置
 * 所属页面：src/views/system/UserManagement.vue
 */
export const userSearchFields: SearchField[] = [
  {
    prop: 'name', // 字段属性名
    label: '姓名', // 字段显示名称
    type: 'input', // 字段类型
    placeholder: '请输入', // 占位符
  },
  {
    prop: 'phone',
    label: '手机号',
    type: 'input',
    placeholder: '请输入',
  },
  {
    prop: 'username',
    label: '用户名',
    type: 'input',
    placeholder: '请输入',
  },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择',
    options: [
      // 下拉选项
      { label: '启用', value: '启用' },
      { label: '禁用', value: '禁用' },
    ],
  },
]

/**
 * 部门管理搜索字段配置
 * 所属页面：src/views/system/DepartmentManagement.vue
 */
export const departmentSearchFields: SearchField[] = [
  {
    prop: 'name', // 字段属性名
    label: '部门名称', // 字段显示名称
    type: 'input', // 字段类型
    placeholder: '请输入', // 占位符
  },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择',
    options: [
      // 下拉选项
      { label: '启用', value: '启用' },
      { label: '禁用', value: '禁用' },
    ],
  },
]

/**
 * 角色管理搜索字段配置
 * 所属页面：src/views/system/RoleManagement.vue
 */
export const roleSearchFields: SearchField[] = [
  {
    prop: 'name', // 字段属性名
    label: '角色名称', // 字段显示名称
    type: 'input', // 字段类型
    placeholder: '请输入', // 占位符
  },
]
