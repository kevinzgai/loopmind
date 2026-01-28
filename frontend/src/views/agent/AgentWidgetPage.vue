<template>
  <div class="agent-widget-container">
    <!-- 加载状态 -->
    <div v-if="isLoadingAgent" class="loading-container">
      <div class="loading-spinner"></div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="agentError" class="error-container">
      <p>❌ {{ agentError }}</p>
    </div>

    <!-- 正常聊天界面 -->
    <div v-else class="widget-chat-box">
      <!-- 头部：精简显示智能体名和关闭按钮（可选，由外部脚本控制更好） -->
      <div class="widget-header">
        <div class="agent-info">
          <div class="agent-avatar-mini">
            <img v-if="agent?.avatar && (agent.avatar.startsWith('http') || agent.avatar.startsWith('data:'))" 
                 :src="agent.avatar" :alt="agent.name" />
            <span v-else>{{ agent?.avatar || '🤖' }}</span>
          </div>
          <span class="agent-name">{{ agent?.name }}</span>
        </div>
        <div class="header-actions">
           <button @click="toggleTTS" class="icon-btn" :class="{ 'active': ttsEnabled }">
            <Volume2 v-if="ttsEnabled" :size="16" />
            <VolumeX v-else :size="16" />
          </button>
        </div>
      </div>

      <!-- 消息区域 -->
      <div class="messages-area" ref="messagesArea">
        <div v-if="messages.length === 0" class="welcome-section">
          <div class="welcome-icon">{{ agent?.avatar || '🤖' }}</div>
          <p class="welcome-text">{{ agent?.initialMemory || 'Hi! 有什么我可以帮你的吗？' }}</p>
        </div>
        
        <div class="bubble-list">
          <div
            v-for="message in messages"
            :key="message.id"
            :class="['bubble', message.role === 'user' ? 'bubble-user' : 'bubble-assistant']"
          >
            <div class="bubble-content" v-html="renderMessageContent(message.content)"></div>
          </div>
          <div v-if="isLoading" class="bubble bubble-assistant">
            <div class="bubble-content">
              <Loader />
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="input-area">
        <div class="input-wrapper">
          <textarea 
            v-model="inputText"
            @keydown.enter.prevent="sendMessage"
            placeholder="输入消息..."
            :disabled="isLoading"
            rows="1"
            ref="inputRef"
          ></textarea>
          <button @click="sendMessage" :disabled="!inputText.trim() || isLoading" class="send-btn">
            <Send :size="18" />
          </button>
        </div>
        <div class="footer-note">Powered by Chart AI</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Volume2, VolumeX, Send } from 'lucide-vue-next'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { Loader } from '@/components/ai-elements/loader'
import { getAgent } from '@/services/agentService.js'

const route = useRoute()
const agentId = route.params.agentId

const agent = ref(null)
const isLoadingAgent = ref(false)
const agentError = ref(null)
const messages = ref([])
const inputText = ref('')
const isLoading = ref(false)
const ttsEnabled = ref(false)
const messagesArea = ref(null)
const inputRef = ref(null)

// 匿名用户 ID
const getAnonymousUserId = () => {
  let id = localStorage.getItem('anonymous_user_id')
  if (!id) {
    id = 'user_' + Math.random().toString(36).substr(2, 9)
    localStorage.setItem('anonymous_user_id', id)
  }
  return id
}
const userId = getAnonymousUserId()

// 滚动到底部
const scrollToBottom = async () => {
  await nextTick()
  if (messagesArea.value) {
    messagesArea.value.scrollTop = messagesArea.value.scrollHeight
  }
}

watch(messages, scrollToBottom, { deep: true })

// 加载智能体
const loadAgent = async () => {
  try {
    isLoadingAgent.value = true
    const data = await getAgent(agentId)
    agent.value = data.agent
  } catch (err) {
    agentError.value = '加载失败'
    console.error(err)
  } finally {
    isLoadingAgent.value = false
  }
}

// 发送消息
const sendMessage = async () => {
  const text = inputText.value.trim()
  if (!text || isLoading.value) return

  inputText.value = ''
  messages.value.push({ id: Date.now(), role: 'user', content: text })
  
  const aiMessageId = Date.now() + 1
  messages.value.push({ id: aiMessageId, role: 'assistant', content: '' })
  isLoading.value = true

  try {
    const response = await fetch(`/api/agent/${agentId}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, message: text })
    })

    if (!response.ok) throw new Error('Request failed')

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let fullResponse = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      fullResponse += decoder.decode(value, { stream: true })
      messages.value[messages.value.length - 1].content = fullResponse
    }
  } catch (error) {
    console.error(error)
    messages.value[messages.value.length - 1].content = '发送失败，请稍后重试。'
  } finally {
    isLoading.value = false
  }
}

const toggleTTS = () => { ttsEnabled.value = !ttsEnabled.value }

const renderMessageContent = (content) => {
  if (!content) return ''
  try {
    return DOMPurify.sanitize(marked.parse(content))
  } catch (e) {
    return content
  }
}

onMounted(() => {
  loadAgent()
})
</script>

<style scoped>
/* 确保 iframe 内部没有边距导致的滚动条 */
:global(body) {
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.agent-widget-container {
  height: 100vh;
  width: 100%;
  background: white;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.widget-chat-box {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.widget-header {
  padding: 10px 15px;
  background: #fff;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.agent-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.agent-avatar-mini {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  overflow: hidden;
}

.agent-avatar-mini img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.agent-name {
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.icon-btn {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}

.icon-btn.active {
  color: #4299e1;
}

.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  background: #f9f9f9;
}

.welcome-section {
  text-align: center;
  padding: 20px 0;
  color: #666;
}

.welcome-icon {
  font-size: 40px;
  margin-bottom: 10px;
}

.welcome-text {
  font-size: 14px;
  line-height: 1.5;
}

.bubble-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bubble {
  max-width: 85%;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
}

.bubble-user {
  align-self: flex-end;
  background: #1a73e8;
  color: white;
  border-bottom-right-radius: 2px;
}

.bubble-assistant {
  align-self: flex-start;
  background: white;
  color: #333;
  border: 1px solid #eee;
  border-bottom-left-radius: 2px;
}

.input-area {
  padding: 12px 15px;
  background: white;
  border-top: 1px solid #eee;
  flex-shrink: 0;
  position: relative;
  z-index: 10;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.03);
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  background: #f0f2f5;
  border-radius: 20px;
  padding: 5px 12px;
  gap: 8px;
}

textarea {
  flex: 1;
  border: none;
  background: transparent;
  padding: 8px 0;
  font-size: 14px;
  resize: none;
  max-height: 100px;
  outline: none;
}

.send-btn {
  background: none;
  border: none;
  color: #1a73e8;
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  transition: opacity 0.2s;
}

.send-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.footer-note {
  font-size: 10px;
  color: #ccc;
  text-align: center;
  margin-top: 5px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #eee;
  border-top: 2px solid #1a73e8;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

:deep(.bubble-content) p { margin: 0; }
:deep(.bubble-content) pre { 
  background: #f1f1f1; 
  padding: 8px; 
  border-radius: 4px; 
  overflow-x: auto; 
  margin: 5px 0;
}
:deep(.bubble-content) code { 
  background: #f1f1f1; 
  padding: 2px 4px; 
  border-radius: 3px;
}
</style>
