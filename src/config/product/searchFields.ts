import type { SearchField } from '@/components/SearchForm/types'

/**
 * 许可模版配置搜索字段配置
 * 所属页面：src/views/product/LicenseTemplateConfig.vue
 */
export const licenseTemplateSearchFields: SearchField[] = [
  {
    prop: 'name', // 字段属性名
    label: '名称', // 字段显示名称
    type: 'input', // 字段类型
    placeholder: '请输入' // 占位符
  },
  {
    prop: 'productName',
    label: '产品名称',
    type: 'input',
    placeholder: '请输入'
  },
  {
    prop: 'version',
    label: '版本号',
    type: 'input',
    placeholder: '请输入'
  },
  {
    prop: 'licenseType',
    label: '许可类型',
    type: 'input',
    placeholder: '请输入'
  },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择',
    options: [ // 下拉选项
      { label: '启用', value: '启用' },
      { label: '停用', value: '停用' }
    ]
  }
]

/**
 * 产品模块配置搜索字段配置
 * 所属页面：src/views/product/ProductModuleConfig.vue
 */
export const productModuleSearchFields: SearchField[] = [
  {
    prop: 'name',
    label: '名称',
    type: 'input',
    placeholder: '请输入'
  },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择',
    options: [
      { label: '启用', value: '启用' },
      { label: '停用', value: '停用' }
    ]
  }
]
