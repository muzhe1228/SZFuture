export const statusMap: Record<string, string> = {
  // 通用状态
  正常: 'success',
  关闭: 'danger',
  禁用: 'warning',
  启用: 'success',
  
  // 授权状态
  已激活: 'success',
  未激活: 'info',
  已授权: 'success',
  未授权: 'info',
  已过期: 'danger',
  过期: 'danger',
  已冻结: 'warning',
  冻结: 'warning',
  已解冻: 'success',
  解冻: 'success',
  
  // 订单状态
  已完成: 'success',
  处理中: 'warning',
  已取消: 'danger',
  待支付: 'warning',
  已支付: 'success',
  已退款: 'info',
  
  // 审批状态
  审批中: 'warning',
  已通过: 'success',
  已拒绝: 'danger',
  待审批: 'info',
  
  // 试用状态
  试用中: 'warning',
  试用到期: 'danger',
  试用完成: 'success',
  
  // 客户状态
  客户正常: 'success',
  客户冻结: 'warning',
  客户关闭: 'danger',
  
  // 系统日志状态
  成功: 'success',
  失败: 'danger',
  错误: 'danger',
  警告: 'warning',
  信息: 'info',
  
  // 作废状态
  已作废: 'info',
  作废: 'info',
  
  // 产品类型
  产品: 'primary',
  版本: 'warning',
  功能: 'success',
}

export const getStatusType = (status: string | undefined): string => {
  return statusMap[status || ''] || 'info'
}