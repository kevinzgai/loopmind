import { ref, computed } from 'vue'
import apiService from '../../../services/apiService.js'

/**
 * 认证状态管理
 * 使用 Composition API 管理用户认证状态
 */

// 状态
export const user = ref(null)
export const token = ref(localStorage.getItem('token') || null)
export const isLoading = ref(false)
export const error = ref(null)

// 计算属性
export const isAuthenticated = computed(() => !!token.value && !!user.value)
export const currentUser = computed(() => user.value)
export const isAdmin = computed(() => !!token.value && !!user.value && user.value.role === 'admin')

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

    // 保存 token 和用户信息
    token.value = response.token
    user.value = response.user
    localStorage.setItem('token', response.token)
    localStorage.setItem('user', JSON.stringify(response.user))

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
 * 初始化认证状态（从本地存储恢复）
 */
export function initializeAuth() {
  const savedToken = localStorage.getItem('token')
  const savedUser = localStorage.getItem('user')

  if (savedToken) {
    token.value = savedToken
  }

  if (savedUser) {
    try {
      user.value = JSON.parse(savedUser)
    } catch (err) {
      console.error('❌ 解析用户信息失败:', err)
      localStorage.removeItem('user')
    }
  }
}
