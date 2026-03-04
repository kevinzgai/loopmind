import axios from 'axios'

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: '/api', // 基础URL，与vite.config.js中的proxy配置对应
  timeout: 30000, // 请求超时时间增加到 30 秒
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
    const { code, data, message } = response.data
    
    // 如果响应中没有 code 字段，说明是旧格式，直接返回原始数据
    if (typeof code === 'undefined') {
      return response.data
    }
    
    // 如果 code 为 0，表示成功，返回 data
    if (code === 0) {
      return data
    }
    
    // 如果 code 不为 0，表示业务错误
    return Promise.reject(new Error(message || '操作失败'))
  },
  error => {
    // 响应错误处理
    if (error.response) {
      // 服务器返回错误状态码
      const { status, data } = error.response
      
      // 处理新的响应格式 { code, data, message }
      if (data && typeof data.code !== 'undefined') {
        // 处理无效 token
        if (data.code === 1004 || data.message?.includes('token') || data.message?.includes('Token')) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          window.location.href = '/login'
          return Promise.reject(new Error('登录已失效，请重新登录'))
        }
        
        return Promise.reject(new Error(data.message || '操作失败'))
      }
      
      // 兼容旧的错误格式
      if (data.error?.code === 'INVALID_TOKEN') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return Promise.reject(new Error('登录已失效，请重新登录'))
      }
      
      // 根据状态码处理不同错误
      switch (status) {
        case 400:
          return Promise.reject(new Error(data.error?.message || data.message || '请求参数错误'))
        case 401:
          return Promise.reject(new Error(data.error?.message || data.message || '未授权，请重新登录'))
        case 403:
          return Promise.reject(new Error(data.error?.message || data.message || '拒绝访问'))
        case 404:
          return Promise.reject(new Error(data.error?.message || data.message || '请求资源不存在'))
        case 500:
          return Promise.reject(new Error(data.error?.message || data.message || '服务器错误'))
        default:
          return Promise.reject(new Error(data.error?.message || data.message || `请求错误 (${status})`))
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
  get(url, params = {}, options = {}) {
    return apiClient.get(url, { params, ...options })
  },
  
  // POST 请求
  post(url, data = {}, options = {}) {
    return apiClient.post(url, data, options)
  },
  
  // PUT 请求
  put(url, data = {}, options = {}) {
    return apiClient.put(url, data, options)
  },
  
  // DELETE 请求
  delete(url, options = {}) {
    return apiClient.delete(url, options)
  },
  
  // PATCH 请求
  patch(url, data = {}) {
    return apiClient.patch(url, data)
  },
  
  // 通用请求方法
  request(url, options = {}) {
    const { method = 'GET', params, body, data } = options
    const config = { ...options }
    
    if (params) {
      config.params = params
    }
    
    if (body || data) {
      config.data = body || data
    }
    
    switch (method.toUpperCase()) {
      case 'GET':
        return apiClient.get(url, config)
      case 'POST':
        return apiClient.post(url, config.data, config)
      case 'PUT':
        return apiClient.put(url, config.data, config)
      case 'DELETE':
        return apiClient.delete(url, config)
      case 'PATCH':
        return apiClient.patch(url, config.data, config)
      default:
        return apiClient.get(url, config)
    }
  },
  
  // AI 模型配置相关接口
  aiConfig: {
    // 获取 AI 模型配置
    get() {
      return apiClient.get('/admin/config/ai')
    },
    // 保存 AI 模型配置
    save(data) {
      return apiClient.put('/admin/config/ai', data)
    },
    // 测试 AI 模型连接
    testConnection(data) {
      return apiClient.post('/admin/config/test-connection', data)
    }
  },
  
  // Embedding 模型配置相关接口
  embeddingConfig: {
    // 获取 Embedding 模型配置
    get() {
      return apiClient.get('/admin/config/embedding')
    },
    // 保存 Embedding 模型配置
    save(data) {
      return apiClient.put('/admin/config/embedding', data)
    },
    // 测试 Embedding 模型连接
    testConnection(data) {
      return apiClient.post('/admin/config/test-connection', data)
    }
  },
  
  // 统一配置接口（向后兼容）
  config: {
    // 获取所有配置
    get() {
      return apiClient.get('/admin/config')
    },
    // 保存所有配置
    save(data) {
      return apiClient.put('/admin/config', data)
    }
  },
  
  // 语音服务配置相关接口
  speechConfig: {
    // 获取语音服务配置
    get() {
      return apiClient.get('/admin/config/speech')
    },
    // 保存语音服务配置
    save(data) {
      return apiClient.put('/admin/config/speech', data)
    }
  }
}
