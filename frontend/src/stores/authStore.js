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

    console.log('✅ 注册成功')
    return response.user
  } catch (err) {
    error.value = err.message
    console.error('❌ 注册失败:', err.message)
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

    console.log('✅ Login response:', response)
    console.log('👤 User from login:', response.user)

    // 保存 token 和用户信息
    token.value = response.token
    user.value = response.user
    console.log('Setting token and user in authStore:', { token: !!token.value, user: !!user.value })
    localStorage.setItem('token', response.token)
    localStorage.setItem('user', JSON.stringify(response.user))

    // 加载用户权限
    await loadUserPermissions()

    console.log('✅ 登录成功')
    return response
  } catch (err) {
    error.value = err.message
    console.error('❌ 登录失败:', err.message)
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

    // 清除本地数据
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    console.log('✅ 登出成功')
  } catch (err) {
    console.error('❌ 登出失败:', err.message)
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
    console.error('❌ 获取用户信息失败:', err.message)
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

    console.log('✅ Token 刷新成功')
    return response.token
  } catch (err) {
    console.error('❌ Token 刷新失败:', err.message)
    // Token 刷新失败，清除本地数据
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

    console.log('✅ 个人资料更新成功')
    return response.user
  } catch (err) {
    error.value = err.message
    console.error('❌ 个人资料更新失败:', err.message)
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

    console.log('✅ 密码修改成功')
  } catch (err) {
    error.value = err.message
    console.error('❌ 密码修改失败:', err.message)
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

  console.log('🔄 Initializing auth:', { hasToken: !!savedToken, hasUser: !!savedUser })

  if (savedToken) {
    token.value = savedToken
  }

  if (savedUser) {
    try {
      const parsedUser = JSON.parse(savedUser)
      console.log('📦 Parsed user from localStorage:', parsedUser)
      user.value = parsedUser
      
      // 从服务器获取最新的用户信息（确保包含 isSuperAdmin 字段）
      try {
        const response = await apiService.get('/auth/me')
        console.log('✅ Got latest user info from server:', response.user)
        user.value = response.user
        localStorage.setItem('user', JSON.stringify(response.user))
      } catch (err) {
        console.error('❌ 获取最新用户信息失败:', err)
      }
      
      // 加载用户权限
      await loadUserPermissions()
    } catch (err) {
      console.error('❌ 解析用户信息失败:', err)
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
    
    // 如果权限接口返回了 isSuperAdmin 标识，更新用户对象
    if (response.isSuperAdmin !== undefined && user.value) {
      user.value = {
        ...user.value,
        isSuperAdmin: response.isSuperAdmin
      }
      localStorage.setItem('user', JSON.stringify(user.value))
      console.log('✅ Updated isSuperAdmin from permissions API:', response.isSuperAdmin)
    }
    
    return permissions.value
  } catch (err) {
    console.error('❌ 加载权限失败:', err.message)
    return []
  }
}

/**
 * 检查用户是否有指定权限
 */
export function hasPermission(permission) {
  if (!user.value) {
    console.log('❌ hasPermission: No user')
    return false
  }
  
  console.log('🔐 hasPermission:', {
    permission,
    isSuperAdmin: user.value.isSuperAdmin,
    role: user.value.role,
    user: user.value
  })
  
  // isSuperAdmin 拥有所有权限
  if (user.value.isSuperAdmin === true) {
    console.log('✅ hasPermission: isSuperAdmin, returning true')
    return true
  }
  
  // 检查权限列表
  const result = permissions.value.includes(permission)
  console.log('🔐 hasPermission: checking permissions list:', { 
    hasPermission: result, 
    permissions: permissions.value 
  })
  return result
}

/**
 * 检查用户是否有多个权限
 * @param {Array} permissionList - 权限列表
 * @param {Boolean} requireAll - 是否需要全部权限
 */
export function hasPermissions(permissionList, requireAll = false) {
  if (!user.value) return false
  
  // isSuperAdmin 拥有所有权限
  if (user.value.isSuperAdmin === true) return true
  
  if (!Array.isArray(permissionList) || permissionList.length === 0) {
    return false
  }
  
  if (requireAll) {
    return permissionList.every(p => permissions.value.includes(p))
  } else {
    return permissionList.some(p => permissions.value.includes(p))
  }
}
