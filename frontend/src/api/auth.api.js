import apiClient from './client.js'

/**
 * 认证相关 API
 */
export const authApi = {
  // 登录
  login(credentials) {
    return apiClient.post('/auth/login', credentials)
  },

  // 注册
  register(userData) {
    return apiClient.post('/auth/register', userData)
  },

  // 获取当前用户信息
  getProfile() {
    return apiClient.get('/auth/profile')
  },

  // 更新用户资料
  updateProfile(profileData) {
    return apiClient.put('/auth/profile', profileData)
  },

  // 登出
  logout() {
    return apiClient.post('/auth/logout')
  },
}

export default authApi
