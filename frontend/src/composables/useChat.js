import { ref } from 'vue'
import { chatApi } from '@/api/chat.api.js'

/**
 * 对话逻辑复用
 */
export function useChat() {
  const messages = ref([])
  const loading = ref(false)
  const error = ref(null)
  const conversations = ref([])
  const currentConversationId = ref(null)

  // 加载对话列表
  async function loadConversations() {
    try {
      loading.value = true
      const res = await chatApi.getConversations()
      conversations.value = res.data.data || []
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // 创建新对话
  async function createConversation(agentId) {
    try {
      loading.value = true
      const res = await chatApi.createConversation(agentId)
      currentConversationId.value = res.data.data._id
      return res.data.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // 发送消息
  async function sendMessage(message) {
    try {
      loading.value = true
      error.value = null
      const res = await chatApi.sendMessage(currentConversationId.value, message)
      messages.value.push(res.data.data)
      return res.data.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // 清空对话
  async function clearConversation() {
    if (!currentConversationId.value) return
    try {
      await chatApi.clearConversation(currentConversationId.value)
      messages.value = []
    } catch (err) {
      error.value = err.message
    }
  }

  return {
    messages,
    loading,
    error,
    conversations,
    currentConversationId,
    loadConversations,
    createConversation,
    sendMessage,
    clearConversation,
  }
}

export default useChat
