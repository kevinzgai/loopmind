/**
 * 智能体服务
 */

import apiService from '@/services/apiService.js'
import { logout } from '@/stores/authStore.js';

const API_BASE = '/agent';

/**
 * 自动生成智能体配置
 */
export async function generateAgentConfig(prompt) {
  try {
    return await apiService.post(`${API_BASE}/generate-config`, { prompt })
  } catch (error) {
    throw error
  }
}

/**
 * 创建智能体
 */
export async function createAgent(agentData, token) {
  try {
    return await apiService.post(`${API_BASE}/create`, agentData)
  } catch (error) {
    // 错误已经在 apiService 中处理
    throw error
  }
}

/**
 * 获取用户的智能体列表
 */
export async function getUserAgents(token, page = 1, limit = 10) {
  try {
    return await apiService.get(`${API_BASE}/my-agents`, { page, limit })
  } catch (error) {
    // 错误已经在 apiService 中处理
    throw error
  }
}

/**
 * 获取已发布的智能体列表（广场）
 */
export async function getPublishedAgents(page = 1, limit = 10, category = '全部') {
  try {
    const params = { page, limit }
    if (category && category !== '全部') {
      params.category = category
    }
    return await apiService.get(`${API_BASE}/published`, params)
  } catch (error) {
    // 错误已经在 apiService 中处理
    throw error
  }
}

/**
 * 获取智能体详情
 */
export async function getAgent(agentId) {
  try {
    return await apiService.get(`${API_BASE}/${agentId}`)
  } catch (error) {
    // 错误已经在 apiService 中处理
    throw error
  }
}

/**
 * 更新智能体
 */
export async function updateAgent(agentId, updateData, token) {
  try {
    return await apiService.put(`${API_BASE}/${agentId}`, updateData)
  } catch (error) {
    // 错误已经在 apiService 中处理
    throw error
  }
}

/**
 * 发布智能体
 */
export async function publishAgent(agentId, token) {
  try {
    return await apiService.post(`${API_BASE}/${agentId}/publish`)
  } catch (error) {
    // 错误已经在 apiService 中处理
    throw error
  }
}

/**
 * 下架智能体
 */
export async function unpublishAgent(agentId, token) {
  try {
    return await apiService.post(`${API_BASE}/${agentId}/unpublish`)
  } catch (error) {
    // 错误已经在 apiService 中处理
    throw error
  }
}

export async function deleteAgent(agentId, token) {
  try {
    return await apiService.delete(`${API_BASE}/${agentId}`)
  } catch (error) {
    // 错误已经在 apiService 中处理
    throw error
  }
}

/**
 * 获取用户与智能体的记忆
 */
export async function getMemory(agentId, token) {
  try {
    return await apiService.get(`${API_BASE}/${agentId}/memory`)
  } catch (error) {
    // 错误已经在 apiService 中处理
    throw error
  }
}

/**
 * 获取智能体对话历史
 */
export async function getAgentChatHistory(agentId, userId) {
  try {
    const params = userId ? { userId } : {};
    return await apiService.get(`${API_BASE}/${agentId}/history`, params);
  } catch (error) {
    // 错误已经在 apiService 中处理
    throw error
  }
}

/**
 * 列出用户与智能体的会话列表（需登录）
 */
export async function listAgentConversations(agentId) {
  try {
    return await apiService.get(`${API_BASE}/${agentId}/conversations`)
  } catch (error) {
    throw error
  }
}

/**
 * 创建新的智能体会话（需登录）
 */
export async function createAgentConversation(agentId, title = '新对话') {
  try {
    return await apiService.post(`${API_BASE}/${agentId}/conversations`, { title })
  } catch (error) {
    throw error
  }
}

/**
 * 获取指定会话的消息（需登录）
 */
export async function getAgentConversationMessages(agentId, conversationId) {
  try {
    return await apiService.get(`${API_BASE}/${agentId}/conversations/${conversationId}`)
  } catch (error) {
    throw error
  }
}

/**
 * 删除指定的智能体会话（需登录）
 */
export async function deleteAgentConversation(agentId, conversationId) {
  try {
    return await apiService.delete(`${API_BASE}/${agentId}/conversations/${conversationId}`)
  } catch (error) {
    throw error
  }
}
