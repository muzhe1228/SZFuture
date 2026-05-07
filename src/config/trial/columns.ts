import type { ColumnConfig } from '@/components/DataTable/types'

/**
 * 试用列表表格列配置
 * 所属页面：src/views/trial/TrialList.vue
 */
export const trialColumns: ColumnConfig[] = [
  {
    key: 'customerName', // 列唯一标识
    label: '客户名称', // 列显示名称
    prop: 'customerName', // 数据字段名
    minWidth: '140', // 最小宽度
    visible: true // 是否默认显示
  },
  {
    key: 'phone',
    label: '手机号',
    prop: 'phone',
    minWidth: '130',
    visible: true
  },
  {
    key: 'bindDate',
    label: '绑定日期',
    prop: 'bindDate',
    minWidth: '170',
    visible: true
  },
  {
    key: 'authStartDate',
    label: '授权起始日期',
    prop: 'authStartDate',
    minWidth: '170',
    visible: true
  },
  {
    key: 'authEndDate',
    label: '授权结束日期',
    prop: 'authEndDate',
    minWidth: '170',
    visible: true
  },
  {
    key: 'status',
    label: '状态',
    prop: 'status',
    width: '100', // 固定宽度
    visible: true,
    hasTemplate: true // 是否使用自定义模板
  }
]
