// 系统管理模块类型

export interface User {
  id: number
  name: string
  username: string
  phone: string
  email: string
  createTime: string
  status: '启用' | '禁用'
  department?: string
  gender?: string
  position?: string
  permission?: string
  remarks?: string
  avatar?: string
}

export interface Role {
  id: number
  name: string
  status: '启用' | '停用'
  sort: number
  description: string
  createTime: string
}

export interface Department {
  id: number
  name: string
  parentId: number
  sort: number
  createTime: string
  status: '启用' | '禁用'
  remarks: string
  children?: Department[]
}

export interface OrgTreeNode {
  id: number
  label: string
  children?: OrgTreeNode[]
}

// 授权管理模块类型

export interface Customer {
  id: number
  name: string
  contact: string
  phone: string
  email?: string
  salesOwner?: string
  accountStatus: '正常' | '冻结' | '关闭'
  createDate: string
}

export interface Order {
  id: number
  orderNo: string
  createTime: string
  customerName: string
  authCount: number
  authStartDate: string
  authEndDate: string
  account?: string
  productName?: string
  productVersion?: string
  licenseTemplate?: string
  licenseType?: string
  floatingEnabled?: boolean
  floatingLicense?: string
  remarks?: string
}

export interface Authorization {
  id: number
  customerName: string
  authNo: string
  bindDate: string
  authStartDate: string
  authEndDate: string
  status: '已激活' | '未激活' | '已冻结' | '已作废'
  product?: string
  version?: string
  licenseType?: string
  remarks?: string
  freezeTime?: string
  freezeReason?: string
}

export interface Trial {
  id: number
  customerName: string
  phone: string
  bindDate: string
  authStartDate: string
  authEndDate: string
  status: '已激活' | '未激活' | '已过期' | '已冻结'
  contactName?: string
  contactPhone?: string
  productName?: string
  trialDuration?: number
  createTime?: string
  remarks?: string
}

// 产品管理模块类型

export interface ProductModule {
  id: number
  name: string
  type: '产品' | '版本' | '功能' | '模块'
  status: '启用' | '停用'
  description: string
  parentId?: number
  children?: ProductModule[]
}

export interface LicenseTemplate {
  id: number
  name: string
  productName: string
  version: string
  status: '启用' | '停用'
  createTime: string
  productModuleId?: number
  licenseType?: '订阅' | '永久' | '试用'
  validityPeriod?: number
  floatingLicense?: boolean
  floatingLicenseCount?: number
  description?: string
  functions?: { id: number; name: string; limit: string; checked: boolean }[]
}

// 审批管理模块类型

export interface Approval {
  id: number
  item: string
  authNo: string
  customerName: string
  operator: string
  operateTime: string
  status: '待审核' | '已通过' | '已拒绝'
}

// 运维管理模块类型

export interface OperationLog {
  id: number
  operator: string
  description: string
  duration: number
  method: string
  params: string
  ipAddress: string
  location: string
  createTime: string
}

export interface AccessLog {
  id: number
  operation: string
  ipAddress: string
  addressType: string
  user: string
  account: string
  createTime: string
}

// 消息模块类型

export interface Message {
  id: number
  customerName: string
  phone: string
  expiryTime: number
  status: '未处理' | '已处理'
  startDate: string
  endDate: string
}

// 系统配置模块类型

export interface SystemConfig {
  systemName: string
  logoUrl?: string
  bgImageUrl?: string
  sessionTimeout: string
  passwordMinLength: string
  passwordMaxLength: string
  passwordComplexity: '纯数字' | '数字+大小写' | '数字+大小写+特殊字符'
  licenseCheckFrequency: string
  offlineActivationDuration: string
  licenseSyncInterval: string
  alertReceiverSystemError: string
  alertReceiverApiError: string
  alertReceiverLicenseExpiry: string
  alertTriggerThreshold: string
  alertReceiverDeviceBind: string
  alertMethods: string[]
  backupFrequency: '每日' | '每周'
  backupPath: string
  backupRetention: string
  dashboardRefreshRate: string
}

// 通用类型

export interface PermissionNode {
  category: string
  subMenus: { name: string; buttons: string[] }[]
}

export interface ChartData {
  xAxis: string[]
  series: { name: string; data: number[]; color: string }[]
}

export interface PieChartData {
  name: string
  value: number
}
