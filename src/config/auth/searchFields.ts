import type { SearchField } from '@/components/SearchForm/types'

/**
 * 订单列表搜索字段配置
 * 所属页面：src/views/auth/OrderList.vue
 */
export const orderSearchFields: SearchField[] = [
  {
    prop: 'customerName', // 字段属性名
    label: '客户名称', // 字段显示名称
    type: 'select', // 字段类型
    placeholder: '请选择', // 占位符
    options: [ // 下拉选项
      { label: 'xx科技有限公司', value: 'xx科技有限公司' },
      { label: '测试客户A', value: '测试客户A' },
      { label: '测试客户B', value: '测试客户B' }
    ]
  },
  {
    prop: 'orderNo',
    label: '订单编号',
    type: 'select',
    placeholder: '请选择',
    options: [
      { label: 'SGZZ-20210906-001', value: 'SGZZ-20210906-001' },
      { label: 'SGZZ-20210907-002', value: 'SGZZ-20210907-002' },
      { label: 'SGZZ-20210908-003', value: 'SGZZ-20210908-003' }
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
    prop: 'licenseType',
    label: '许可类型',
    type: 'select',
    placeholder: '请选择',
    options: [
      { label: '永久许可', value: '永久许可' },
      { label: '订阅许可', value: '订阅许可' },
      { label: '试用许可', value: '试用许可' }
    ]
  }
]

/**
 * 客户列表搜索字段配置
 * 所属页面：src/views/auth/CustomerList.vue
 */
export const customerSearchFields: SearchField[] = [
  {
    prop: 'customerName',
    label: '客户名称',
    type: 'select',
    placeholder: '请选择',
    options: [
      { label: '客户名称客户名称', value: '客户名称客户名称' },
      { label: '测试客户A', value: '测试客户A' },
      { label: '测试客户B', value: '测试客户B' }
    ]
  },
  {
    prop: 'accountStatus',
    label: '账户状态',
    type: 'select',
    placeholder: '请选择',
    options: [
      { label: '正常', value: '正常' },
      { label: '冻结', value: '冻结' },
      { label: '关闭', value: '关闭' }
    ]
  }
]

/**
 * 授权列表搜索字段配置
 * 所属页面：src/views/auth/AuthList.vue
 */
export const authSearchFields: SearchField[] = [
  {
    prop: 'customerName',
    label: '客户名称',
    type: 'select',
    placeholder: '请选择',
    options: [
      { label: '客户名称客户名称', value: '客户名称客户名称' },
      { label: '测试客户A', value: '测试客户A' },
      { label: '测试客户B', value: '测试客户B' }
    ]
  },
  { 
    prop: 'orderNo', 
    label: '订单编号', 
    type: 'input', 
    placeholder: '请输入' 
  },
  { 
    prop: 'authNo', 
    label: '授权编号', 
    type: 'input', 
    placeholder: '请输入' 
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
    prop: 'licenseType',
    label: '许可类型',
    type: 'select',
    placeholder: '请选择',
    options: [
      { label: '永久许可', value: '永久许可' },
      { label: '订阅许可', value: '订阅许可' },
      { label: '试用许可', value: '试用许可' }
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
      { label: '已冻结', value: '已冻结' },
      { label: '已作废', value: '已作废' }
    ]
  },
  { 
    prop: 'dateRange', 
    label: '授权起止时间', 
    type: 'datetimerange' 
  }
]
