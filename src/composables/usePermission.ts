import { computed } from 'vue'
import {
  getUserInfo,
  hasRole,
  hasPermission,
  hasAnyRole,
  hasAnyPermission,
  hasAllPermissions,
  checkPermission,
  type PermissionConfig,
} from '@/utils/permission'

export function usePermission() {
  const userInfo = computed(() => getUserInfo())
  const isLoggedIn = computed(() => !!userInfo.value)
  const role = computed(() => userInfo.value?.role ?? '')
  const permissions = computed(() => userInfo.value?.permissions ?? [])

  const can = (permission: string): boolean => hasPermission(permission)
  const canAny = (permissions: string[]): boolean => hasAnyPermission(permissions)
  const canAll = (permissions: string[]): boolean => hasAllPermissions(permissions)
  const is = (roleName: string): boolean => hasRole(roleName)
  const isAny = (roles: string[]): boolean => hasAnyRole(roles)
  const check = (config?: PermissionConfig): boolean => checkPermission(config)

  return {
    userInfo,
    isLoggedIn,
    role,
    permissions,
    can,
    canAny,
    canAll,
    is,
    isAny,
    check,
  }
}
