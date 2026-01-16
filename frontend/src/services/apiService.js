import axios from 'axios'
import { logout } from '../modules/auth/stores/authStore.js'

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: '/api', // 基础URL，与vite.config.js中的proxy配置对应
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
apiClient.interceptors.request.use(
  config => {
    // 从本地存储获取 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    // 请求错误处理
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  response => {
    // 直接返回响应数据
    return response.data
  },
  error => {
    // 响应错误处理
    if (error.response) {
      // 服务器返回错误状态码
      const { status, data } = error.response
      
      // 处理无效 token
      if (data.error?.code === 'INVALID_TOKEN') {
        logout()
        window.location.href = '/login'
        return Promise.reject(new Error('登录已失效，请重新登录'))
      }
      
      // 根据状态码处理不同错误
      switch (status) {
        case 400:
          return Promise.reject(new Error(data.error?.message || '请求参数错误'))
        case 401:
          return Promise.reject(new Error(data.error?.message || '未授权，请重新登录'))
        case 403:
          return Promise.reject(new Error(data.error?.message || '拒绝访问'))
        case 404:
          return Promise.reject(new Error(data.error?.message || '请求资源不存在'))
        case 500:
          return Promise.reject(new Error(data.error?.message || '服务器错误'))
        default:
          return Promise.reject(new Error(data.error?.message || `请求错误 (${status})`))
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      return Promise.reject(new Error('网络错误，请检查网络连接'))
    } else {
      // 请求配置错误
      return Promise.reject(new Error('请求配置错误'))
    }
  }
)

// 统一请求方法封装
export default {
  // GET 请求
  get(url, params = {}) {
    return apiClient.get(url, { params })
  },
  
  // POST 请求
  post(url, data = {}) {
    return apiClient.post(url, data)
  },
  
  // PUT 请求
  put(url, data = {}) {
    return apiClient.put(url, data)
  },
  
  // DELETE 请求
  delete(url, params = {}) {
    return apiClient.delete(url, { params })
  },
  
  // PATCH 请求
  patch(url, data = {}) {
    return apiClient.patch(url, data)
  }
}
