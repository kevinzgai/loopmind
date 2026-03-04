import api from './apiService.js'

export async function getDashboardStats() {
  const response = await api.get('/dashboard/stats')
  return response
}

export async function getTrendData(days = 7) {
  const response = await api.get('/dashboard/trend', { days })
  return response
}

export async function getTopAgents(limit = 5) {
  const response = await api.get('/dashboard/top-agents', { limit })
  return response
}

export async function getCategoryStats() {
  const response = await api.get('/dashboard/categories')
  return response
}

export async function getFullDashboard() {
  const response = await api.get('/dashboard/full')
  return response
}

export async function getSystemDetails() {
  const response = await api.get('/dashboard/system-details')
  return response
}

export default {
  getDashboardStats,
  getTrendData,
  getTopAgents,
  getCategoryStats,
  getFullDashboard,
  getSystemDetails
}
