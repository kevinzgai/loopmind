import api from './apiService.js'

export async function getMyApiKeys() {
  const response = await api.get('/api-key')
  return response
}

export async function createApiKey(name, expiresAt) {
  const response = await api.post('/api-key', { name, expiresAt })
  return response
}

export async function deleteApiKey(id) {
  const response = await api.delete(`/api-key/${id}`)
  return response
}

export async function toggleApiKeyStatus(id) {
  const response = await api.patch(`/api-key/${id}/toggle`)
  return response
}

export async function getApiKeyStats(id) {
  const response = await api.get(`/api-key/${id}/stats`)
  return response
}

export async function getAllApiKeysStats() {
  const response = await api.get('/api-key/stats/overview')
  return response
}

export async function getMyApiKey() {
  const response = await api.get('/api-key/my-key')
  return response
}

export async function resetMyApiKey() {
  const response = await api.post('/api-key/reset-key')
  return response
}
