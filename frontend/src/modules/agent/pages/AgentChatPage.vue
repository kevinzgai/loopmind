<template>
  <div class="agent-chat-page">
    <!-- 加载状态 -->
    <div v-if="isLoadingAgent" class="loading-container">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <p>正在加载智能体...</p>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="agentError" class="error-container">
      <div class="error-content">
        <h2>❌ 加载失败</h2>
        <p>{{ agentError }}</p>
        <router-link to="/" class="back-btn">返回首页</router-link>
      </div>
    </div>

    <!-- 正常聊天界面 -->
    <div v-else class="chat-page">
      <div class="chat-header">
        <router-link to="/" class="back-button">
          ← 返回首页
        </router-link>
        
        <!-- 智能体信息 -->
        <div class="agent-info" v-if="agent">
          <div class="agent-avatar-container">
            <img v-if="agent.avatar && (agent.avatar.startsWith('http') || agent.avatar.startsWith('data:'))" 
                 :src="agent.avatar" :alt="agent.name" class="agent-avatar" />
            <div v-else class="agent-avatar-placeholder">{{ agent.avatar || '🤖' }}</div>
          </div>
          <div class="agent-details">
            <h1 class="agent-name">{{ agent.name }}</h1>
            <p class="agent-model">{{ getModelName(agent.model) }}</p>
          </div>
        </div>
        
        <div class="header-info">
          <!-- TTS 开关 -->
          <button 
            @click="toggleTTS" 
            class="tts-toggle-btn"
            :class="{ 'active': ttsEnabled, 'speaking': isSpeaking }"
            :title="ttsEnabled ? '关闭语音播报' : '开启语音播报'"
          >
            <Volume2 v-if="ttsEnabled" :size="20" />
            <VolumeX v-else :size="20" />
          </button>
          
          <span class="status-badge" :class="{ 'online': isOnline }">
            {{ isOnline ? '● 在线' : '○ 离线' }}
          </span>
        </div>
      </div>

      <div class="chat-container">
        <!-- 消息列表区域 -->
        <div class="messages-area">
          <Conversation class="h-full">
            <ConversationContent>
              <div v-for="message in messages" :key="message.id">
                <Message :from="message.role">
                  <MessageContent v-html="renderMessageContent(message.content)" />
                </Message>
              </div>

              <Message v-if="isLoading" from="assistant">
                <MessageContent>
                  <Loader />
                </MessageContent>
              </Message>
            </ConversationContent>
          </Conversation>
        </div>

        <!-- 固定在底部的输入框 -->
        <div class="input-area">
          <VoiceInput 
            v-model="inputText"
            @submit="sendMessage"
            @autoSubmit="handleAutoSubmit"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Volume2, VolumeX } from 'lucide-vue-next'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { Conversation, ConversationContent } from '@/components/ai-elements/conversation'
import { Message, MessageContent } from '@/components/ai-elements/message'
import { Loader } from '@/components/ai-elements/loader'
import VoiceInput from '@/modules/chat/components/VoiceInput.vue'
import { token } from '@/modules/auth/stores/authStore.js'
import { getAgent, getMemory } from '../services/agentService.js'

const route = useRoute()
const agentId = route.params.agentId

// 智能体相关状态
const agent = ref(null)
const isLoadingAgent = ref(false)
const agentError = ref(null)
const memory = ref(null)

// 聊天相关状态
const userId = 'user_' + Math.random().toString(36).substr(2, 9)
const isOnline = ref(true)
const messages = ref([])
const inputText = ref('')
const isLoading = ref(false)
const ttsEnabled = ref(false)
const isSpeaking = ref(false)

let audioQueue = []
let isPlayingQueue = false
let ttsRequestQueue = []
let activeTTSRequests = 0
const MAX_CONCURRENT_TTS = 1

// 获取模型名称
const getModelName = (model) => {
  const models = {
    deepseek: 'DeepSeek',
    qwen: '通义千问'
  }
  return models[model] || model
}

// 加载智能体信息
const loadAgent = async () => {
  try {
    isLoadingAgent.value = true
    agentError.value = null

    // 获取智能体信息
    const agentData = await getAgent(agentId)
    agent.value = agentData

    // 如果用户已登录，获取记忆
    if (token.value) {
      try {
        const memoryData = await getMemory(agentId, token.value)
        memory.value = memoryData
      } catch (err) {
        console.warn('获取记忆失败:', err.message)
        // 记忆获取失败不影响聊天
      }
    }

    // 初始化对话
    initializeChat()
  } catch (err) {
    agentError.value = err.message
    console.error('❌ 加载智能体失败:', err.message)
  } finally {
    isLoadingAgent.value = false
  }
}

// 初始化对话
const initializeChat = () => {
  const welcomeMessage = agent.value.personality 
    ? `你好！我是 ${agent.value.name}。${agent.value.personality}`
    : `你好！我是 ${agent.value.name}，很高兴与你对话！`

  messages.value = [
    {
      id: Date.now(),
      role: 'assistant',
      content: welcomeMessage
    }
  ]

  // 如果有记忆，可以在这里加载历史对话
  if (memory.value && memory.value.content) {
    console.log('📝 加载用户记忆:', memory.value.content.substring(0, 100) + '...')
  }
}

// 切换 TTS 开关
function toggleTTS() {
  ttsEnabled.value = !ttsEnabled.value
  
  if (!ttsEnabled.value) {
    stopAllAudio()
  }
}

// 停止所有音频播放
function stopAllAudio() {
  audioQueue.forEach(audio => {
    audio.pause()
    audio.currentTime = 0
  })
  audioQueue = []
  ttsRequestQueue = []
  isPlayingQueue = false
  isSpeaking.value = false
}

// 处理 TTS 请求队列
async function processTTSQueue() {
  while (ttsRequestQueue.length > 0 && activeTTSRequests < MAX_CONCURRENT_TTS) {
    const task = ttsRequestQueue.shift()
    if (task) {
      activeTTSRequests++
      try {
        await task()
      } catch (error) {
        console.error('TTS 任务执行失败:', error)
      } finally {
        activeTTSRequests--
        if (ttsRequestQueue.length > 0) {
          processTTSQueue()
        }
      }
    }
  }
}

// 播放音频队列
async function playAudioQueue() {
  if (isPlayingQueue || audioQueue.length === 0) return
  
  isPlayingQueue = true
  isSpeaking.value = true
  
  while (audioQueue.length > 0) {
    const audio = audioQueue.shift()
    if (audio) {
      try {
        await playAudio(audio)
      } catch (error) {
        console.error('播放音频失败:', error)
      }
    }
  }
  
  isPlayingQueue = false
  isSpeaking.value = false
}

// 播放单个音频
function playAudio(audio) {
  return new Promise((resolve, reject) => {
    audio.onended = () => resolve()
    audio.onerror = () => reject(new Error('音频播放失败'))
    audio.play().catch(reject)
  })
}

// 文本转语音（使用智能体的语音设置）
async function textToSpeech(text) {
  if (!ttsEnabled.value || !text.trim()) return
  
  const ttsTask = async () => {
    try {
      console.log('🔊 开始 TTS 请求:', text.substring(0, 20) + '...')
      
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: text,
          voice: agent.value.voice || 'xiaoxian',
          speechRate: agent.value.speechRate || 150
        })
      })
      
      if (!response.ok) {
        throw new Error('TTS 请求失败')
      }
      
      const blob = await response.blob()
      const audioUrl = URL.createObjectURL(blob)
      const audio = new Audio(audioUrl)
      
      audioQueue.push(audio)
      playAudioQueue()
      
      console.log('✅ TTS 请求完成')
      
    } catch (error) {
      console.error('TTS 转换失败:', error)
    }
  }
  
  ttsRequestQueue.push(ttsTask)
  processTTSQueue()
}

// 发送消息
async function sendMessage() {
  const text = inputText.value.trim()
  if (!text || isLoading.value) return

  await sendMessageToAI(text)
  inputText.value = ''
}

// 自动提交（语音识别后）
async function handleAutoSubmit(text) {
  console.log('🎤 收到自动提交事件，文本:', text)
  if (!text || isLoading.value) {
    console.warn('⚠️ 无法自动提交:', { text, isLoading: isLoading.value })
    return
  }
  await sendMessageToAI(text)
}

// 发送消息到 AI（使用智能体专用接口）
async function sendMessageToAI(text) {
  try {
    stopAllAudio()
    
    messages.value.push({
      id: Date.now(),
      role: 'user',
      content: text
    })
    
    const aiMessageId = Date.now() + 1
    messages.value.push({
      id: aiMessageId,
      role: 'assistant',
      content: ''
    })
    
    isLoading.value = true

    // 使用智能体专用聊天接口
    const response = await fetch(`/api/agent/${agentId}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token.value ? { 'Authorization': `Bearer ${token.value}` } : {})
      },
      body: JSON.stringify({
        userId: token.value ? `user_${userId}` : userId,
        message: text
      })
    })

    if (!response.ok) {
      throw new Error('Request failed')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let fullResponse = ''
    let lastSentenceEnd = 0

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      fullResponse += chunk
      
      const lastMessage = messages.value[messages.value.length - 1]
      if (lastMessage && lastMessage.role === 'assistant') {
        lastMessage.content = fullResponse
      }
      
      // 如果启用了 TTS，检查是否有完整的句子
      if (ttsEnabled.value) {
        const sentenceEndRegex = /[。！？.!?]+/g
        let match
        
        while ((match = sentenceEndRegex.exec(fullResponse)) !== null) {
          const endIndex = match.index + match[0].length
          
          if (endIndex > lastSentenceEnd) {
            const sentence = fullResponse.substring(lastSentenceEnd, endIndex).trim()
            if (sentence.length > 0) {
              console.log('🔊 播放句子:', sentence)
              textToSpeech(sentence)
            }
            lastSentenceEnd = endIndex
          }
        }
      }
    }
    
    // 处理最后可能剩余的文本
    if (ttsEnabled.value && lastSentenceEnd < fullResponse.length) {
      const remainingText = fullResponse.substring(lastSentenceEnd).trim()
      if (remainingText.length > 0) {
        console.log('🔊 播放剩余文本:', remainingText)
        textToSpeech(remainingText)
      }
    }
    
    isLoading.value = false
    
  } catch (error) {
    console.error('Failed to send message', error)
    isOnline.value = false
    isLoading.value = false
  }
}

const renderMessageContent = (content) => {
  if (!content) return ''
  
  try {
    marked.setOptions({
      gfm: true,
      breaks: true,
      smartLists: true,
      smartypants: true,
    })
    
    let html = marked.parse(content)
    html = DOMPurify.sanitize(html)
    
    return html
  } catch (error) {
    console.warn('Markdown conversion failed:', error)
    return content
  }
}

onMounted(() => {
  loadAgent()
  
  fetch('/api/health')
    .then(res => res.json())
    .then(() => {
      isOnline.value = true
    })
    .catch(() => {
      isOnline.value = false
    })
})
</script>

<style scoped>
.agent-chat-page {
  height: calc(100vh - 60px);
  background: #f7fafc;
}

.loading-container,
.error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.loading-content,
.error-content {
  text-align: center;
  padding: 2rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #4299e1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-content h2 {
  color: #e53e3e;
  margin-bottom: 1rem;
}

.error-content p {
  color: #718096;
  margin-bottom: 2rem;
}

.back-btn {
  padding: 0.75rem 1.5rem;
  background: #4299e1;
  color: white;
  text-decoration: none;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #3182ce;
}

.chat-page {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.back-button {
  padding: 0.5rem 1rem;
  background: #f7fafc;
  color: #4a5568;
  text-decoration: none;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
}

.back-button:hover {
  background: #edf2f7;
  color: #2d3748;
}

.agent-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  justify-content: center;
}

.agent-avatar,
.agent-avatar-placeholder {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  background: #f0f0f0;
  flex-shrink: 0;
}

.agent-details {
  text-align: center;
}

.agent-name {
  font-size: 1.25rem;
  font-weight: bold;
  color: #2d3748;
  margin: 0;
}

.agent-model {
  font-size: 0.875rem;
  color: #718096;
  margin: 0;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  background: #fed7d7;
  color: #c53030;
}

.status-badge.online {
  background: #c6f6d5;
  color: #22543d;
}

.tts-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: #f7fafc;
  color: #718096;
  cursor: pointer;
  transition: all 0.2s;
}

.tts-toggle-btn:hover {
  background: #edf2f7;
  color: #4a5568;
}

.tts-toggle-btn.active {
  background: #48bb78;
  color: white;
}

.tts-toggle-btn.active:hover {
  background: #38a169;
}

.tts-toggle-btn.speaking {
  animation: pulse-speaking 1.5s ease-in-out infinite;
}

@keyframes pulse-speaking {
  0%, 100% { 
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(72, 187, 120, 0.4);
  }
  50% { 
    transform: scale(1.05);
    box-shadow: 0 0 0 8px rgba(72, 187, 120, 0);
  }
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 0;
  overflow: hidden;
}

.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  padding-bottom: 0;
}

.input-area {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem 1.5rem;
  background: linear-gradient(to top, #f7fafc 80%, transparent);
  z-index: 10;
}

:deep(.markdown-content) h1 {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 1rem 0;
  padding-bottom: 0.3rem;
  border-bottom: 1px solid #e2e8f0;
}

:deep(.markdown-content) h2 {
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0.8rem 0;
  padding-bottom: 0.2rem;
  border-bottom: 1px solid #e2e8f0;
}

:deep(.markdown-content) h3 {
  font-size: 1.1rem;
  font-weight: bold;
  margin: 0.6rem 0;
}

:deep(.markdown-content) p {
  margin: 0.5rem 0;
  line-height: 1.6;
}

:deep(.markdown-content) code {
  background-color: #f1f5f9;
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
}

:deep(.markdown-content) pre {
  background-color: #f1f5f9;
  border-radius: 0.25rem;
  padding: 1rem;
  overflow-x: auto;
  margin: 1rem 0;
}

:deep(.markdown-content) pre code {
  background-color: transparent;
  padding: 0;
}

@media (max-width: 768px) {
  .chat-header {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
  }

  .agent-info {
    justify-content: flex-start;
  }

  .header-info {
    align-self: flex-end;
  }
}
</style>