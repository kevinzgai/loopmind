import api from './apiService.js'

/**
 * 统一解包 apiService 响应
 * apiService 拦截器返回 { code, data, message }，实际数据在 data 字段
 */
function unwrap(response) {
  return response?.data ?? response
}

export async function getDashboardStats() {
  const response = await api.get('/dashboard/stats')
  return unwrap(response)
}

export async function getTrendData(days = 7) {
  const response = await api.get('/dashboard/trend', { days })
  return unwrap(response)
}

export async function getTopAgents(limit = 5) {
  const response = await api.get('/dashboard/top-agents', { limit })
  return unwrap(response)
}

export async function getCategoryStats() {
  const response = await api.get('/dashboard/categories')
  return unwrap(response)
}

export async function getFullDashboard() {
  const response = await api.get('/dashboard/full')
  return unwrap(response)
}

export async function getSystemDetails() {
  const response = await api.get('/dashboard/system-details')
  return unwrap(response)
}

export default {
  getDashboardStats,
  getTrendData,
  getTopAgents,
  getCategoryStats,
  getFullDashboard,
  getSystemDetails
}
