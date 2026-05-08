export interface PermissionConfig {
  role?: string
  permissions?: string[]
}

export interface UserInfo {
  id: number
  username: string
  name: string
  role: string
  permissions: string[]
}

const USER_INFO_KEY = 'user_info'

export const setUserInfo = (userInfo: UserInfo): void => {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo))
}

export const getUserInfo = (): UserInfo | null => {
  const userInfoStr = localStorage.getItem(USER_INFO_KEY)
  return userInfoStr ? JSON.parse(userInfoStr) : null
}

export const clearUserInfo = (): void => {
  localStorage.removeItem(USER_INFO_KEY)
}

export const hasRole = (role: string): boolean => {
  const userInfo = getUserInfo()
  return userInfo?.role === role
}

export const hasAnyRole = (roles: string[]): boolean => {
  const userInfo = getUserInfo()
  return roles.some((role) => userInfo?.role === role)
}

export const hasPermission = (permission: string): boolean => {
  const userInfo = getUserInfo()
  return userInfo?.permissions.includes(permission) ?? false
}

export const hasAnyPermission = (permissions: string[]): boolean => {
  const userInfo = getUserInfo()
  return permissions.some((permission) => userInfo?.permissions.includes(permission))
}

export const hasAllPermissions = (permissions: string[]): boolean => {
  const userInfo = getUserInfo()
  return permissions.every((permission) => userInfo?.permissions.includes(permission))
}

export const checkPermission = (config?: PermissionConfig): boolean => {
  if (!config) return true

  const { role, permissions } = config

  if (role && !hasRole(role)) {
    return false
  }

  if (permissions && permissions.length > 0) {
    return hasAnyPermission(permissions)
  }

  return true
}
