import type { App, DirectiveBinding } from 'vue'
import { hasRole, hasPermission } from './permission'

export const setupPermissionDirectives = (app: App): void => {
  app.directive('has-role', {
    mounted(el: HTMLElement, binding: DirectiveBinding<string | string[]>) {
      const roles = Array.isArray(binding.value) ? binding.value : [binding.value]
      if (!roles.some((role) => hasRole(role))) {
        el.style.display = 'none'
      }
    },
  })

  app.directive('has-permission', {
    mounted(el: HTMLElement, binding: DirectiveBinding<string | string[]>) {
      const permissions = Array.isArray(binding.value) ? binding.value : [binding.value]
      if (!permissions.some((permission) => hasPermission(permission))) {
        el.style.display = 'none'
      }
    },
  })
}
