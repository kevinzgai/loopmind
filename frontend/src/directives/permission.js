import { hasPermission, hasPermissions, user } from '@/stores/authStore.js'
import { watch } from 'vue'

export const permission = {
  mounted(el, binding) {
    const { value, modifiers } = binding
    
    if (value === 'admin') {
      el._unwatch = watch(user, (newUser) => {
        if (newUser && newUser.isSuperAdmin === true) {
          el.style.display = ''
          el._permissionHidden = false
        } else {
          el.style.display = 'none'
          el._permissionHidden = true
        }
      }, { immediate: true, deep: true })
      return
    }
    
    if (typeof value === 'string') {
      el._unwatch = watch(user, () => {
        const result = hasPermission(value)
        
        if (result) {
          el.style.display = ''
          el._permissionHidden = false
        } else {
          el.style.display = 'none'
          el._permissionHidden = true
        }
      }, { immediate: true, deep: true })
      return
    }
    
    if (Array.isArray(value)) {
      const requireAll = modifiers.all
      
      el._unwatch = watch(user, () => {
        const result = hasPermissions(value, requireAll)
        
        if (result) {
          el.style.display = ''
          el._permissionHidden = false
        } else {
          el.style.display = 'none'
          el._permissionHidden = true
        }
      }, { immediate: true, deep: true })
      return
    }
  },
  
  unmounted(el) {
    if (el._unwatch) {
      el._unwatch()
    }
  }
}

export function setupPermissionDirective(app) {
  app.directive('permission', permission)
}
