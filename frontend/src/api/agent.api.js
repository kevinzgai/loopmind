import apiClient from './client.js'

/**
 * 智能体相关 API
 */
export const agentApi = {
  // 获取智能体列表
  getAgents(params) {
    return apiClient.get('/agent', { params })
  },

  // 获取智能体详情
  getAgent(agentId) {
    return apiClient.get(`/agent/${agentId}`)
  },

  // 创建智能体
  createAgent(agentData) {
    return apiClient.post('/agent', agentData)
  },

  // 更新智能体
  updateAgent(agentId, agentData) {
    return apiClient.put(`/agent/${agentId}`, agentData)
  },

  // 删除智能体
  deleteAgent(agentId) {
    return apiClient.delete(`/agent/${agentId}`)
  },

  // 获取我的智能体
  getMyAgents() {
    return apiClient.get('/agent/my-agents')
  },

  // 获取公开智能体
  getPublicAgents() {
    return apiClient.get('/agent/marketplace')
  },
}

export default agentApi
