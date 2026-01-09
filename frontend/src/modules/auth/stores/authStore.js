import { ref, computed } from 'vue'

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

/**
 * 注册
 */
export async function register(username, email, password, confirmPassword) {
  try {
    isLoading.value = true
    error.value = null

    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        email,
        password,
        confirmPassword
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message || '注册失败')
    }

    console.log('✅ 注册成功')
    return data.user
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

    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        password
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message || '登录失败')
    }

    // 保存 token 和用户信息
    token.value = data.token
    user.value = data.user
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))

    console.log('✅ 登录成功')
    return data
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
      await fetch('http://localhost:3000/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      })
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

    const response = await fetch('http://localhost:3000/api/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })

    const data = await response.json()

    if (!response.ok) {
      // Token 无效，清除本地数据
      token.value = null
      user.value = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      return null
    }

    user.value = data.user
    return data.user
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

    const response = await fetch('http://localhost:3000/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message || 'Token 刷新失败')
    }

    token.value = data.token
    localStorage.setItem('token', data.token)

    console.log('✅ Token 刷新成功')
    return data.token
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
