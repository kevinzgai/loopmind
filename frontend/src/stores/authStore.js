import { ref, computed } from 'vue'
import apiService from '@/services/apiService.js'

/**
 * 认证状态管理
 * 使用 Composition API 管理用户认证状态
 */

// 状态
export const user = ref(null)
export const token = ref(localStorage.getItem('token') || null)
export const isLoading = ref(false)
export const error = ref(null)
export const permissions = ref([])

// 计算属性
export const isAuthenticated = computed(() => !!token.value && !!user.value)
export const currentUser = computed(() => user.value)
export const isAdmin = computed(() => {
  if (!token.value || !user.value) return false
  return user.value.role === 'admin' || user.value.role === 'super_admin'
})
export const isSuperAdmin = computed(() => {
  if (!token.value || !user.value) return false
  return user.value.isSuperAdmin === true
})

/**
 * 注册
 */
export async function register(username, email, password, confirmPassword) {
  try {
    isLoading.value = true
    error.value = null

    const response = await apiService.post('/auth/register', {
      username,
      email,
      password,
      confirmPassword
    })

    return response.user
  } catch (err) {
    error.value = err.message
    throw err
  } finally {
    isLoading.value = false
  }
}

/**
 * 登录
 */
export async function login(username, password) {
  try {
    isLoading.value = true
    error.value = null

    const response = await apiService.post('/auth/login', {
      username,
      password
    })

    token.value = response.token
    user.value = response.user
    localStorage.setItem('token', response.token)
    localStorage.setItem('user', JSON.stringify(response.user))

    await loadUserPermissions()

    return response
  } catch (err) {
    error.value = err.message
    throw err
  } finally {
    isLoading.value = false
  }
}

/**
 * 登出
 */
export async function logout() {
  try {
    isLoading.value = true

    if (token.value) {
      await apiService.post('/auth/logout')
    }

    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  } catch (err) {
    // 忽略登出失败
  } finally {
    isLoading.value = false
  }
}

/**
 * 获取当前用户信息
 */
export async function getCurrentUser() {
  try {
    if (!token.value) {
      return null
    }

    const response = await apiService.get('/auth/me')
    user.value = response.user
    return response.user
  } catch (err) {
    // 401 已由 apiService 拦截器统一处理跳转
    return null
  }
}

/**
 * 刷新 Token
 */
export async function refreshToken() {
  try {
    if (!token.value) {
      return null
    }

    const response = await apiService.post('/auth/refresh')
    
    token.value = response.token
    localStorage.setItem('token', response.token)

    return response.token
  } catch (err) {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    throw err
  }
}

/**
 * 更新个人资料
 */
export async function updateProfile(profileData) {
  try {
    isLoading.value = true
    error.value = null

    const response = await apiService.put('/auth/profile', profileData)
    
    user.value = response.user
    localStorage.setItem('user', JSON.stringify(response.user))

    return response.user
  } catch (err) {
    error.value = err.message
    throw err
  } finally {
    isLoading.value = false
  }
}

/**
 * 修改密码
 */
export async function changePassword(oldPassword, newPassword, confirmPassword) {
  try {
    isLoading.value = true
    error.value = null

    await apiService.post('/auth/change-password', {
      oldPassword,
      newPassword,
      confirmPassword
    })
  } catch (err) {
    error.value = err.message
    throw err
  } finally {
    isLoading.value = false
  }
}

/**
 * 初始化认证状态（从本地存储恢复）
 */
export async function initializeAuth() {
  const savedToken = localStorage.getItem('token')
  const savedUser = localStorage.getItem('user')

  if (savedToken) {
    token.value = savedToken
  }

  if (savedUser) {
    try {
      user.value = JSON.parse(savedUser)
      
      try {
        const response = await apiService.get('/auth/me')
        user.value = response.user
        localStorage.setItem('user', JSON.stringify(response.user))
      } catch (err) {
        // 401 已由 apiService 拦截器统一处理跳转，此处只需清除本地缓存
        token.value = null
        user.value = null
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        return
      }
      
      await loadUserPermissions()
    } catch (err) {
      localStorage.removeItem('user')
    }
  }
}

/**
 * 加载用户权限
 */
export async function loadUserPermissions() {
  if (!user.value) return []
  
  try {
    const response = await apiService.get('/auth/permissions')
    permissions.value = response.permissions || []
    return permissions.value
  } catch (err) {
    return []
  }
}

/**
 * 检查用户是否有指定权限
 */
export function hasPermission(permission) {
  if (!user.value) return false
  
  // admin / super_admin 拥有所有权限
  if (
    user.value.role === 'admin' ||
    user.value.role === 'super_admin' ||
    user.value.isSuperAdmin === true
  ) return true
  
  // 检查权限列表
  return permissions.value.includes(permission)
}

/**
 * 检查用户是否有多个权限
 * @param {Array} permissionList - 权限列表
 * @param {Boolean} requireAll - 是否需要全部权限
 */
export function hasPermissions(permissionList, requireAll = false) {
  if (!user.value) return false
  
  // admin / super_admin 拥有所有权限
  if (
    user.value.role === 'admin' ||
    user.value.role === 'super_admin' ||
    user.value.isSuperAdmin === true
  ) return true
  
  if (!Array.isArray(permissionList) || permissionList.length === 0) {
    return false
  }
  
  if (requireAll) {
    return permissionList.every(p => permissions.value.includes(p))
  } else {
    return permissionList.some(p => permissions.value.includes(p))
  }
}
