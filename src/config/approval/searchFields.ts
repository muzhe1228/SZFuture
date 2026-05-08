import type { SearchField } from '@/components/SearchForm/types'

/**
 * 审批列表搜索字段配置
 * 所属页面：src/views/approval/ApprovalList.vue
 */
export const approvalSearchFields: SearchField[] = [
  {
    prop: 'item', // 字段属性名
    label: '审批事项', // 字段显示名称
    type: 'select', // 字段类型
    placeholder: '请选择', // 占位符
    options: [
      // 下拉选项
      { label: '授权激活', value: '授权激活' },
      { label: '授权冻结', value: '授权冻结' },
      { label: '授权解冻', value: '授权解冻' },
      { label: '授权延期', value: '授权延期' },
      { label: '授权作废', value: '授权作废' },
    ],
  },
  {
    prop: 'customerName',
    label: '客户名称',
    type: 'select',
    placeholder: '请选择',
    options: [
      { label: '客户名称1111', value: '客户名称1111' },
      { label: '客户名称2222', value: '客户名称2222' },
      { label: '客户名称3333', value: '客户名称3333' },
    ],
  },
  {
    prop: 'authNo',
    label: '授权编号',
    type: 'input',
    placeholder: '请输入',
  },
  {
    prop: 'status',
    label: '审批状态',
    type: 'select',
    placeholder: '请选择',
    options: [
      { label: '待审核', value: '待审核' },
      { label: '已通过', value: '已通过' },
      { label: '已拒绝', value: '已拒绝' },
    ],
  },
]
