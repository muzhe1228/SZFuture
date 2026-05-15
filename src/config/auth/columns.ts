import type { ColumnConfig } from '@/components/DataTable/types'

/**
 * 订单列表表格列配置
 * 所属页面：src/views/auth/OrderList.vue
 */
export const orderColumns: ColumnConfig[] = [
  {
    key: 'orderNo', // 列唯一标识
    label: '订单编号', // 列显示名称
    prop: 'orderNo', // 数据字段名
    minWidth: '180', // 最小宽度
    visible: true, // 是否默认显示
  },
  {
    key: 'customerName',
    label: '客户名称',
    prop: 'customerName',
    minWidth: '180',
    visible: true,
  },
  {
    key: 'authCount',
    label: '授权数量',
    prop: 'authCount',
    width: '100', // 固定宽度
    visible: true,
  },
  {
    key: 'authStartDate',
    label: '授权起始日期',
    prop: 'authStartDate',
    minWidth: '170',
    visible: true,
  },
  {
    key: 'authEndDate',
    label: '授权结束日期',
    prop: 'authEndDate',
    minWidth: '170',
    visible: true,
  },
  {
    key: 'status',
    label: '状态',
    prop: 'status',
    width: '100',
    visible: true,
    viewType: 'status',
  },
  {
    key: 'createTime',
    label: '创建时间',
    prop: 'createTime',
    minWidth: '170',
    visible: true,
  },
]

/**
 * 客户列表表格列配置
 * 所属页面：src/views/auth/CustomerList.vue
 */
export const customerColumns: ColumnConfig[] = [
  {
    key: 'name',
    label: '客户名称',
    prop: 'name',
    minWidth: '160',
    visible: true,
  },
  {
    key: 'contact',
    label: '联系人',
    prop: 'contact',
    minWidth: '120',
    visible: true,
  },
  {
    key: 'phone',
    label: '手机号',
    prop: 'phone',
    minWidth: '140',
    visible: true,
  },
  {
    key: 'accountStatus',
    label: '账户状态',
    prop: 'accountStatus',
    width: '100',
    visible: true,
    hasTemplate: true,
  },
  {
    key: 'createDate',
    label: '创建日期',
    prop: 'createDate',
    minWidth: '170',
    visible: true,
  },
]

/**
 * 授权列表表格列配置
 * 所属页面：src/views/auth/AuthList.vue
 */
export const authColumns: ColumnConfig[] = [
  {
    key: 'customerName',
    label: '客户名称',
    prop: 'customerName',
    minWidth: '140',
    visible: true,
  },
  {
    key: 'authNo',
    label: '授权编号',
    prop: 'authNo',
    minWidth: '140',
    visible: true,
  },
  {
    key: 'bindDate',
    label: '绑定日期',
    prop: 'bindDate',
    minWidth: '170',
    visible: true,
  },
  {
    key: 'authStartDate',
    label: '授权起始日期',
    prop: 'authStartDate',
    minWidth: '170',
    visible: true,
  },
  {
    key: 'authEndDate',
    label: '授权结束日期',
    prop: 'authEndDate',
    minWidth: '170',
    visible: true,
  },
  {
    key: 'status',
    label: '状态',
    prop: 'status',
    minWidth: '100',
    visible: true,
    hasTemplate: true,
    viewType: 'status',
  },
  {
    key: 'product',
    label: '产品',
    prop: 'product',
    minWidth: '140',
    visible: false,
    viewField: true,
  },
  {
    key: 'version',
    label: '版本',
    prop: 'version',
    minWidth: '100',
    visible: false,
    viewField: true,
  },
  {
    key: 'licenseType',
    label: '许可类型',
    prop: 'licenseType',
    minWidth: '120',
    visible: false,
    viewField: true,
  },
  {
    key: 'remarks',
    label: '备注',
    prop: 'remarks',
    minWidth: '200',
    visible: false,
    viewField: true,
  },
]
