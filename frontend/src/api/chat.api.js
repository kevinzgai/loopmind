import apiClient from './client.js'

/**
 * 对话相关 API
 */
export const chatApi = {
  // 发送消息
  sendMessage(conversationId, message) {
    return apiClient.post('/chat/send', { conversationId, message })
  },

  // 获取对话历史
  getConversation(conversationId) {
    return apiClient.get(`/chat/conversation/${conversationId}`)
  },

  // 获取对话列表
  getConversations() {
    return apiClient.get('/chat/conversations')
  },

  // 创建对话
  createConversation(agentId) {
    return apiClient.post('/chat/conversation', { agentId })
  },

  // 删除对话
  deleteConversation(conversationId) {
    return apiClient.delete(`/chat/conversation/${conversationId}`)
  },

  // 清空对话
  clearConversation(conversationId) {
    return apiClient.post(`/chat/conversation/${conversationId}/clear`)
  },
}

export default chatApi
