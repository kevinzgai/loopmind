/**
 * 智能体服务
 */

import apiService from '@/services/apiService.js'

const API_BASE = '/agent';

/**
 * 自动生成智能体配置
 */
export function generateAgentConfig(prompt) {
  return apiService.post(`${API_BASE}/generate-config`, { prompt }, { timeout: 60000 })
}

/**
 * 创建智能体
 */
export function createAgent(agentData) {
  return apiService.post(`${API_BASE}/create`, agentData)
}

/**
 * 获取用户的智能体列表
 */
export function getUserAgents(page = 1, limit = 10) {
  return apiService.get(`${API_BASE}/my-agents`, { page, limit })
}

/**
 * 获取已发布的智能体列表（广场）
 */
export function getPublishedAgents(page = 1, limit = 10, category = '全部') {
  const params = { page, limit }
  if (category && category !== '全部') {
    params.category = category
  }
  return apiService.get(`${API_BASE}/published`, params)
}

/**
 * 获取智能体详情
 */
export function getAgent(agentId) {
  return apiService.get(`${API_BASE}/${agentId}`)
}

/**
 * 更新智能体
 */
export function updateAgent(agentId, updateData) {
  return apiService.put(`${API_BASE}/${agentId}`, updateData)
}

/**
 * 发布智能体
 */
export function publishAgent(agentId) {
  return apiService.post(`${API_BASE}/${agentId}/publish`)
}

/**
 * 下架智能体
 */
export function unpublishAgent(agentId) {
  return apiService.post(`${API_BASE}/${agentId}/unpublish`)
}

/**
 * 删除智能体
 */
export function deleteAgent(agentId) {
  return apiService.delete(`${API_BASE}/${agentId}`)
}

/**
 * 获取用户与智能体的记忆
 */
export function getMemory(agentId) {
  return apiService.get(`${API_BASE}/${agentId}/memory`)
}

/**
 * 获取智能体对话历史
 */
export function getAgentChatHistory(agentId, userId) {
  const params = userId ? { userId } : {}
  return apiService.get(`${API_BASE}/${agentId}/history`, params)
}

/**
 * 列出用户与智能体的会话列表（需登录）
 */
export function listAgentConversations(agentId) {
  return apiService.get(`${API_BASE}/${agentId}/conversations`)
}

/**
 * 创建新的智能体会话（需登录）
 */
export function createAgentConversation(agentId, title = '新对话') {
  return apiService.post(`${API_BASE}/${agentId}/conversations`, { title })
}

/**
 * 获取指定会话的消息（需登录）
 */
export function getAgentConversationMessages(agentId, conversationId) {
  return apiService.get(`${API_BASE}/${agentId}/conversations/${conversationId}`)
}

/**
 * 删除指定的智能体会话（需登录）
 */
export function deleteAgentConversation(agentId, conversationId) {
  return apiService.delete(`${API_BASE}/${agentId}/conversations/${conversationId}`)
}
