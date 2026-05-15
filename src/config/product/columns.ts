import type { ColumnConfig } from '@/components/DataTable/types'

/**
 * 许可模版配置表格列配置
 * 所属页面：src/views/product/LicenseTemplateConfig.vue
 */
export const licenseTemplateColumns: ColumnConfig[] = [
  {
    key: 'name', // 列唯一标识
    label: '许可模版名称', // 列显示名称
    prop: 'name', // 数据字段名
    minWidth: '160', // 最小宽度
    visible: true, // 是否默认显示
  },
  {
    key: 'productName',
    label: '产品名称',
    prop: 'productName',
    minWidth: '140',
    visible: true,
  },
  {
    key: 'licenseType',
    label: '许可类型',
    prop: 'licenseType',
    minWidth: '120',
    visible: true,
  },
  {
    key: 'status',
    label: '状态',
    prop: 'status',
    width: '100',
    visible: true,
    hasTemplate: true,
    viewType: 'status',
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
 * 产品模块配置表格列配置
 * 所属页面：src/views/product/ProductModuleConfig.vue
 */
export const productModuleColumns: ColumnConfig[] = [
  {
    key: 'name',
    label: '名称',
    prop: 'name',
    minWidth: '200',
    visible: true,
    showOverflowTooltip: true,
  },
  {
    key: 'type',
    label: '类型',
    prop: 'type',
    width: '100',
    visible: true,
    hasTemplate: true,
    viewType: 'status',
  },
  {
    key: 'status',
    label: '状态',
    prop: 'status',
    width: '100',
    visible: true,
    hasTemplate: true,
    viewType: 'status',
  },
  {
    key: 'description',
    label: '说明',
    prop: 'description',
    minWidth: '180',
    visible: true,
    showOverflowTooltip: true,
  },
]
