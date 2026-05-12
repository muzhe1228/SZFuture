import type { SearchField } from '@/components/SearchForm/types'

// 产品下拉选项
export const productOptions = [
  { label: '产品A', value: '产品A' },
  { label: '产品B', value: '产品B' },
  { label: '产品C', value: '产品C' },
]

/**
 * 消息列表搜索字段配置
 * 所属页面：src/views/Messages.vue
 */
export const messageSearchFields: SearchField[] = [
  {
    prop: 'customerName', // 字段属性名
    label: '客户名称', // 字段显示名称
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
    prop: 'product',
    label: '产品',
    type: 'select',
    placeholder: '请选择',
    options: productOptions,
  },
  {
    prop: 'expiryDays',
    label: '到期时间',
    type: 'input',
    placeholder: '',
    suffix: '内', // 后缀
  },
  {
    prop: 'status',
    label: '处理状态',
    type: 'select',
    placeholder: '请选择',
    options: [
      { label: '未处理', value: '未处理' },
      { label: '已处理', value: '已处理' },
    ],
  },
]
