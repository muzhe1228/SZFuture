import type { ColumnConfig } from '@/components/DataTable/types'

/**
 * 审批列表表格列配置
 * 所属页面：src/views/approval/ApprovalList.vue
 */
export const approvalColumns: ColumnConfig[] = [
  {
    key: 'item', // 列唯一标识
    label: '审批事项', // 列显示名称
    prop: 'item', // 数据字段名
    minWidth: '120', // 最小宽度
    visible: true // 是否默认显示
  },
  {
    key: 'authNo',
    label: '授权编号',
    prop: 'authNo',
    minWidth: '180',
    visible: true
  },
  {
    key: 'customerName',
    label: '客户名称',
    prop: 'customerName',
    minWidth: '140',
    visible: true
  },
  {
    key: 'operator',
    label: '操作人',
    prop: 'operator',
    minWidth: '100',
    visible: true
  },
  {
    key: 'operateTime',
    label: '操作时间',
    prop: 'operateTime',
    minWidth: '170',
    visible: true
  },
  {
    key: 'status',
    label: '审批状态',
    prop: 'status',
    width: '120', // 固定宽度
    align: 'center', // 居中对齐
    visible: true,
    hasTemplate: true // 是否使用自定义模板
  }
]
