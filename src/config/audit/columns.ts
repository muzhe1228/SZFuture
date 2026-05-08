import type { ColumnConfig } from '@/components/DataTable/types'

/**
 * 系统日志表格列配置
 * 所属页面：src/views/audit/SystemLogs.vue
 */
export const systemLogColumns: ColumnConfig[] = [
  {
    key: 'operation', // 列唯一标识
    label: '操作', // 列显示名称
    prop: 'operation', // 数据字段名
    minWidth: '120', // 最小宽度
    visible: true, // 是否默认显示
  },
  {
    key: 'ipAddress',
    label: 'IP地址',
    prop: 'ipAddress',
    minWidth: '160',
    visible: true,
  },
  {
    key: 'addressType',
    label: '地址类型',
    prop: 'addressType',
    minWidth: '120',
    visible: true,
  },
  {
    key: 'user',
    label: '用户',
    prop: 'user',
    minWidth: '140',
    visible: true,
  },
  {
    key: 'account',
    label: '账号',
    prop: 'account',
    minWidth: '160',
    visible: true,
  },
  {
    key: 'createTime',
    label: '创建时间',
    prop: 'createTime',
    minWidth: '180',
    visible: true,
  },
]

/**
 * 操作日志表格列配置
 * 所属页面：src/views/OperationLogs.vue
 */
export const operationLogColumns: ColumnConfig[] = [
  {
    key: 'operator', // 列唯一标识
    label: '操作人', // 列显示名称
    prop: 'operator', // 数据字段名
    width: '150', // 固定宽度
    visible: true, // 是否默认显示
  },
  {
    key: 'description',
    label: '操作描述',
    prop: 'description',
    width: '180',
    visible: true,
  },
  {
    key: 'duration',
    label: '耗时',
    prop: 'duration',
    width: '180',
    align: 'left',
    sortable: true,
    visible: true,
    hasTemplate: true, // 是否使用自定义模板
  },
  {
    key: 'method',
    label: '操作方法',
    prop: 'method',
    width: '120',
    visible: true,
    hasTemplate: true,
    showOverflowTooltip: true, // 显示溢出提示
  },
  {
    key: 'params',
    label: '方法参数',
    prop: 'params',
    width: '200',
    visible: true,
    hasTemplate: true,
    showOverflowTooltip: true,
  },
  {
    key: 'ipAddress',
    label: 'IP地址',
    prop: 'ipAddress',
    width: '160',
    visible: true,
  },
  {
    key: 'location',
    label: '操作地点',
    prop: 'location',
    minWidth: '200',
    visible: true,
    hasTemplate: true,
    showOverflowTooltip: true,
  },
  {
    key: 'createTime',
    label: '创建时间',
    prop: 'createTime',
    width: '240',
    sortable: true,
    visible: true,
  },
]
