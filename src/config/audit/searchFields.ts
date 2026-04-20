import type { SearchField } from '@/components/SearchForm/types'

/**
 * 系统日志搜索字段配置
 * 所属页面：src/views/audit/SystemLogs.vue
 */
export const systemLogSearchFields: SearchField[] = [
  {
    prop: 'ipAddress', // 字段属性名
    label: 'ip地址', // 字段显示名称
    type: 'input', // 字段类型
    placeholder: '请输入' // 占位符
  },
  {
    prop: 'user',
    label: '用户',
    type: 'select',
    placeholder: '请选择',
    options: [ // 下拉选项
      { label: 'SevilinMa', value: 'SevilinMa' },
      { label: 'AdminZhang', value: 'AdminZhang' },
      { label: 'OperatorLi', value: 'OperatorLi' },
      { label: 'AdminWang', value: 'AdminWang' }
    ]
  },
  {
    prop: 'dateRange',
    label: '创建日期',
    type: 'daterange'
  }
]

/**
 * 操作日志搜索字段配置
 * 所属页面：src/views/OperationLogs.vue
 */
export const operationLogSearchFields: SearchField[] = [
  {
    prop: 'operator', // 字段属性名
    label: '操作人', // 字段显示名称
    type: 'input', // 字段类型
    placeholder: '请输入', // 占位符
    width: '150px' // 字段宽度
  },
  {
    prop: 'description',
    label: '操作描述',
    type: 'input',
    placeholder: '请输入',
    width: '150px'
  },
  {
    prop: 'dateRange',
    label: '操作时间',
    type: 'daterange',
    width: '260px'
  }
]
