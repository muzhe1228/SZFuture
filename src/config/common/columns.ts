import type { ColumnConfig } from '@/components/DataTable/types'

/**
 * 消息列表表格列配置
 * 所属页面：src/views/Messages.vue
 */
export const messageColumns: ColumnConfig[] = [
  {
    key: 'customerName', // 列唯一标识
    label: '客户名称', // 列显示名称
    prop: 'customerName', // 数据字段名
    minWidth: '160', // 最小宽度
    visible: true, // 是否默认显示
  },
  {
    key: 'phone',
    label: '手机号',
    prop: 'phone',
    minWidth: '130',
    visible: true,
  },
  {
    key: 'expiryTime',
    label: '到期时间',
    prop: 'expiryTime',
    width: '130', // 固定宽度
    visible: true,
  },
  {
    key: 'status',
    label: '处理状态',
    prop: 'status',
    width: '100',
    visible: true,
    hasTemplate: true, // 是否使用自定义模板
  },
  {
    key: 'startDate',
    label: '授权起始日期',
    prop: 'startDate',
    minWidth: '160',
    visible: true,
  },
  {
    key: 'endDate',
    label: '授权结束日期',
    prop: 'endDate',
    minWidth: '160',
    visible: true,
  },
]
