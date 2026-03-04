import { hasPermission, hasPermissions, user } from '@/stores/authStore.js'
import { watch } from 'vue'

export const permission = {
  mounted(el, binding) {
    const { value, modifiers } = binding
    
    console.log('🔍 Permission directive mounted:', { value, user: user.value })
    
    // 处理旧版本的 'admin' 值（向后兼容）
    if (value === 'admin') {
      el._unwatch = watch(user, (newUser) => {
        console.log('🔐 Checking admin permission:', { 
          newUser, 
          isSuperAdmin: newUser?.isSuperAdmin,
          result: newUser && newUser.isSuperAdmin === true 
        })
        
        if (newUser && newUser.isSuperAdmin === true) {
          console.log('✅ Setting display to empty string for element:', el)
          el.style.display = ''
          el._permissionHidden = false
          console.log('✅ Element style after update:', {
            display: el.style.display,
            hidden: el._permissionHidden,
            computedDisplay: window.getComputedStyle(el).display
          })
        } else {
          console.log('❌ Setting display to none for element:', el)
          el.style.display = 'none'
          el._permissionHidden = true
        }
      }, { immediate: true, deep: true })
      return
    }
    
    // 处理单个权限
    if (typeof value === 'string') {
      el._unwatch = watch(user, () => {
        const result = hasPermission(value)
        console.log('🔐 Checking permission:', { permission: value, result })
        
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
    
    // 处理多个权限
    if (Array.isArray(value)) {
      const requireAll = modifiers.all // 使用修饰符 .all 表示需要全部权限
      
      el._unwatch = watch(user, () => {
        const result = hasPermissions(value, requireAll)
        console.log('🔐 Checking permissions:', { permissions: value, requireAll, result })
        
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
