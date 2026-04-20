import type { SearchField } from '@/components/SearchForm/types'

/**
 * 试用列表搜索字段配置
 * 所属页面：src/views/trial/TrialList.vue
 */
export const trialSearchFields: SearchField[] = [
  {
    prop: 'customerName', // 字段属性名
    label: '客户名称', // 字段显示名称
    type: 'select', // 字段类型
    placeholder: '请选择', // 占位符
    options: [ // 下拉选项
      { label: '客户名称客户名称', value: '客户名称客户名称' },
      { label: '测试客户A', value: '测试客户A' },
      { label: '测试客户B', value: '测试客户B' }
    ]
  },
  {
    prop: 'phone',
    label: '手机号',
    type: 'input',
    placeholder: '请输入'
  },
  {
    prop: 'licenseKey',
    label: 'License Key',
    type: 'select',
    placeholder: '请选择',
    options: [
      { label: 'LK-20260125-001', value: 'LK-20260125-001' },
      { label: 'LK-20260201-002', value: 'LK-20260201-002' },
      { label: 'LK-20260210-003', value: 'LK-20260210-003' }
    ]
  },
  {
    prop: 'product',
    label: '产品',
    type: 'select',
    placeholder: '请选择',
    options: [
      { label: '产品A', value: '产品A' },
      { label: '产品B', value: '产品B' },
      { label: '产品C', value: '产品C' }
    ]
  },
  {
    prop: 'version',
    label: '版本号',
    type: 'select',
    placeholder: '请选择',
    options: [
      { label: 'V1.0', value: 'V1.0' },
      { label: 'V2.0', value: 'V2.0' },
      { label: 'V3.0', value: 'V3.0' }
    ]
  },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择',
    options: [
      { label: '已激活', value: '已激活' },
      { label: '未激活', value: '未激活' },
      { label: '已过期', value: '已过期' }
    ]
  },
  {
    prop: 'dateRange',
    label: '授权起止时间',
    type: 'datetimerange'
  }
]
