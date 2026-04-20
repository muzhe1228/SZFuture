/**
 * 状态类型映射工具
 */

// 默认状态类型映射
export const defaultStatusMap: Record<string, string> = {
  '正常': 'success',
  '激活': 'success',
  '已激活': 'warning',
  '未激活': 'info',
  '已冻结': 'danger',
  '冻结': 'warning',
  '已作废': 'info',
  '作废': 'danger',
  '已授权': 'success',
  '未授权': 'info',
  '已过期': 'danger',
  '过期': 'danger',
  '已取消': 'info',
  '关闭': 'danger',
  '禁用': 'warning'
}

/**
 * 获取状态对应的标签类型
 * @param status 状态值
 * @param statusMap 自定义状态映射
 * @returns 标签类型
 */
export const getStatusType = (status: string, statusMap?: Record<string, string>): string => {
  const map = statusMap || defaultStatusMap
  return map[status] || 'info'
}

/**
 * 检查状态是否为有效状态
 * @param status 状态值
 * @param validStatuses 有效状态列表
 * @returns 是否为有效状态
 */
export const isStatusValid = (status: string, validStatuses: string[]): boolean => {
  return validStatuses.includes(status)
}

/**
 * 获取状态的显示文本
 * @param status 状态值
 * @param statusTextMap 状态文本映射
 * @returns 状态显示文本
 */
export const getStatusText = (status: string, statusTextMap?: Record<string, string>): string => {
  if (statusTextMap && statusTextMap[status]) {
    return statusTextMap[status]
  }
  return status
}