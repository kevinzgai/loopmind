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
        <div class="sidebar">
          <div class="sidebar-header">
            <span>会话列表</span>
            <button v-if="token" class="new-conv-btn" @click="handleNewConversation">新建</button>
          </div>
          <div class="conversation-list">
            <div
              v-for="c in conversations"
              :key="c.id"
              class="conversation-item"
              :class="{ active: c.id === activeConversationId }"
              @click="selectConversation(c.id)"
            >
              <div class="conv-content">
                <div class="conv-title">{{ c.title }}</div>
                <div class="conv-meta">{{ formatConvMeta(c) }}</div>
              </div>
              <button class="delete-btn" @click.stop="handleDeleteConversation(c.id)" title="删除会话">
                <Trash2 :size="14" />
              </button>
            </div>
            <div v-if="!token && messages.length" class="conversation-item active">
              <div class="conv-title">当前会话</div>
              <div class="conv-meta">未登录用户</div>
            </div>
          </div>
        </div>
        <div class="chat-main">
          <div class="messages-area">
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
          <div class="input-area">
            <XSender 
              v-model="inputText"
              :disabled="isLoading"
              placeholder="输入消息..."
              @submit="sendMessage"
              @autoSubmit="handleAutoSubmit"
            />
            <div class="input-foot-wrapper">
              <div class="input-foot-left">
                <span><i>📝</i> 支持 Markdown</span>
                <span><i>⌨️</i> Enter 发送</span>
                <span class="input-foot-dividing-line"></span>
                <span class="input-foot-maxlength">{{ inputText.length }}/2000</span>
              </div>
              <div class="input-foot-right">
                <button class="clear-btn" :disabled="!inputText" @click="inputText = ''">清空输入</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, onBeforeRouteLeave } from 'vue-router'
import { Volume2, VolumeX, Trash2 } from 'lucide-vue-next'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { Conversation, ConversationContent } from '@/components/ai-elements/conversation'
import { Message, MessageContent } from '@/components/ai-elements/message'
import { Loader } from '@/components/ai-elements/loader'
import XSender from '@/modules/chat/components/XSender.vue'
import { token } from '@/modules/auth/stores/authStore.js'
import { 
  getAgent, 
  getMemory, 
  getAgentChatHistory, 
  listAgentConversations, 
  createAgentConversation, 
  getAgentConversationMessages,
  deleteAgentConversation
} from '../services/agentService.js'

const route = useRoute()
const agentId = route.params.agentId
const voiceInputRef = ref(null)

// 智能体相关状态
const agent = ref(null)
const isLoadingAgent = ref(false)
const agentError = ref(null)
const memory = ref(null)

// 聊天相关状态
// 尝试从 localStorage 获取匿名用户 ID，如果没有则生成并保存
const getAnonymousUserId = () => {
  let id = localStorage.getItem('anonymous_user_id')
  if (!id) {
    id = 'user_' + Math.random().toString(36).substr(2, 9)
    localStorage.setItem('anonymous_user_id', id)
  }
  return id
}

const userId = getAnonymousUserId()
const isOnline = ref(true)
const messages = ref([])
const inputText = ref('')
const isLoading = ref(false)
const ttsEnabled = ref(false)
const isSpeaking = ref(false)
const conversations = ref([])
const activeConversationId = ref(null)

let audioQueue = []
let isPlayingQueue = false
let currentAudio = null
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
    agent.value = agentData.agent

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

// 加载历史对话
const loadHistory = async () => {
  try {
    const userIdParam = token.value ? null : userId
    const data = await getAgentChatHistory(agentId, userIdParam)
    
    if (data.history && data.history.length > 0) {
      messages.value = data.history.map((msg, index) => ({
        id: Date.now() - (data.history.length - index) * 1000,
        role: msg.role,
        content: msg.content
      }))
      return true
    }
  } catch (e) {
    console.error('Failed to load history', e)
  }
  return false
}

// 初始化对话
const initializeChat = async () => {
  // 如果已登录，处理会话列表
  if (token.value) {
    await loadConversations()
    if (conversations.value.length > 0) {
      // 如果有会话，加载第一个会话
      activeConversationId.value = conversations.value[0].id
      await loadConversationMessages(activeConversationId.value)
    } else {
      // 如果没有会话，创建一个并加载
      const created = await createAgentConversation(agentId, '新对话')
      activeConversationId.value = created.conversation.id
      await loadConversationMessages(activeConversationId.value)
    }
  } else {
    // 如果未登录，尝试加载匿名历史记录
    const hasHistory = await loadHistory()
    if (!hasHistory) {
      showWelcomeMessage()
    }
  }

  // 如果有记忆，可以在这里加载用户记忆摘要（可选，目前后端已在系统提示词中处理）
  if (memory.value && memory.value.content) {
    console.log('📝 加载用户记忆:', memory.value.content.substring(0, 100) + '...')
  }
}

// 显示欢迎语
const showWelcomeMessage = () => {
  // 必须确保 messages 数组为空时才添加
  if (messages.value.length > 0) return

  // 构建欢迎语
  let welcomeMessage = ''
  
  // 1. 初始记忆（最高优先级，作为开场白）
  if (agent.value && agent.value.initialMemory) {
    welcomeMessage += `${agent.value.initialMemory}\n\n`
  } else if (agent.value) {
    welcomeMessage += `Hi，欢迎使用 **${agent.value.name}**\n\n`
  } else {
    welcomeMessage += `Hi，欢迎使用智能体\n\n`
  }
  
  // 2. 人设（引用样式）
  if (agent.value && agent.value.personality) {
    // 检查人设是否已经包含在 initialMemory 中，避免重复
    if (!agent.value.initialMemory || !agent.value.initialMemory.includes(agent.value.personality.substring(0, 20))) {
       welcomeMessage += `> ${agent.value.personality}\n\n`
    }
  }
  
  // 3. 补充说明
  welcomeMessage += `我可以辅助你编码、查询知识和相关作业信息、编写文档等。\n\n`
  welcomeMessage += `_作为 AI 模型，提供的答案可能不总是准确，但你的反馈可以帮助我做得更好。_`

  // 强制使用新数组触发响应式更新
  const newMsg = {
    id: Date.now(),
    role: 'assistant',
    content: welcomeMessage
  }
  messages.value = [newMsg]
  console.log('✅ 欢迎语已设置:', welcomeMessage.substring(0, 50) + '...')
}

// 切换 TTS 开关
function toggleTTS() {
  ttsEnabled.value = !ttsEnabled.value
  stopAllAudio()
}

// 停止所有音频播放
function stopAllAudio() {
  if (currentAudio) {
    try {
      currentAudio.pause()
      currentAudio.currentTime = 0
    } catch {}
    currentAudio = null
  }
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
        currentAudio = audio
        await playAudio(audio)
      } catch (error) {
        console.error('播放音频失败:', error)
      } finally {
        currentAudio = null
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

  inputText.value = ''
  await sendMessageToAI(text)
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

    const url = token.value && activeConversationId.value 
      ? `/api/agent/${agentId}/conversations/${activeConversationId.value}/chat`
      : `/api/agent/${agentId}/chat`

    const response = await fetch(url, {
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
    
    // 如果是新对话的第一条消息，更新会话列表中的标题
    const currentConv = conversations.value.find(c => c.id === activeConversationId.value)
    if (currentConv && currentConv.title === '新对话') {
      // 延迟一下再刷新列表，确保后端已经更新了标题
      setTimeout(loadConversations, 500)
    } else {
      // 否则只更新当前会话的消息计数等信息
      loadConversations()
    }
    
    isLoading.value = false
    
  } catch (error) {
    console.error('Failed to send message', error)
    isOnline.value = false
    isLoading.value = false
  }
}

async function loadConversations() {
  try {
    const data = await listAgentConversations(agentId)
    conversations.value = (data.conversations || []).map(c => ({
      id: c.id, title: c.title, messageCount: c.messageCount, updatedAt: c.updatedAt
    }))
  } catch (err) {
    console.error('获取会话列表失败', err)
  }
}

async function loadConversationMessages(conversationId) {
  try {
    const data = await getAgentConversationMessages(agentId, conversationId)
    const list = data.messages || []
    if (list.length > 0) {
      messages.value = list.map((msg, index) => ({
        id: Date.now() - (list.length - index) * 1000,
        role: msg.role,
        content: msg.content
      }))
    } else {
      // 如果消息列表为空，清空当前消息并显示欢迎语
      messages.value = []
      showWelcomeMessage()
    }
  } catch (err) {
    console.error('获取会话消息失败', err)
  }
}

function formatConvMeta(c) {
  const count = c.messageCount || 0
  const date = c.updatedAt ? new Date(c.updatedAt) : null
  const ds = date ? `${date.getMonth()+1}-${date.getDate()} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}` : ''
  return `消息 ${count} · ${ds}`
}

async function selectConversation(id) {
  if (activeConversationId.value === id) return
  activeConversationId.value = id
  await loadConversationMessages(id)
}

async function handleNewConversation() {
  try {
    const created = await createAgentConversation(agentId, '新对话')
    conversations.value.unshift(created.conversation)
    activeConversationId.value = created.conversation.id
    // 清空消息并显示欢迎语
    messages.value = []
    showWelcomeMessage()
  } catch (err) {
    console.error('新建会话失败', err)
  }
}

async function handleDeleteConversation(id) {
  if (!confirm('确定要删除这个会话吗？删除后无法恢复。')) {
    return
  }
  
  try {
    await deleteAgentConversation(agentId, id)
    
    // 从列表中移除
    const index = conversations.value.findIndex(c => c.id === id)
    if (index !== -1) {
      conversations.value.splice(index, 1)
    }
    
    // 如果删除的是当前会话，切换到第一个会话或新建
    if (activeConversationId.value === id) {
      if (conversations.value.length > 0) {
        activeConversationId.value = conversations.value[0].id
        await loadConversationMessages(activeConversationId.value)
      } else {
        // 如果没有会话了，清空消息并重置状态
        activeConversationId.value = null
        messages.value = []
        // 重新初始化（会显示欢迎语并可能创建新会话）
        initializeChat()
      }
    }
  } catch (err) {
    console.error('删除会话失败', err)
    alert('删除会话失败: ' + (err.message || '未知错误'))
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

onUnmounted(() => {
  stopAllAudio()
})

onBeforeRouteLeave((to, from, next) => {
  stopAllAudio()
  next && next()
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
  font-size: 1.6rem;
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
  padding: 0.35rem 0.85rem;
  border-radius: 1rem;
  font-size: 0.95rem;
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
  flex-direction: row;
  max-width: none;
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.sidebar {
  width: 280px;
  border-right: 1px solid #e2e8f0;
  background: #ffffff;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.new-conv-btn {
  padding: 0.25rem 0.5rem;
  font-size: 12px;
  border-radius: 4px;
  border: 1px solid #cbd5e0;
  background: #f7fafc;
  cursor: pointer;
}

.conversation-list {
  overflow-y: auto;
  padding: 0.5rem;
}

.conversation-item {
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  group: hover;
}

.conv-content {
  flex: 1;
  min-width: 0;
}

.delete-btn {
  display: none;
  background: none;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.conversation-item:hover .delete-btn {
  display: block;
}

.delete-btn:hover {
  background-color: #fed7d7;
  color: #c53030;
}

.conversation-item:hover {
  background: #f7fafc;
}

.conversation-item.active {
  background: #edf2f7;
}

.conv-title {
  font-size: 14px;
  color: #2d3748;
}

.conv-meta {
  font-size: 12px;
  color: #718096;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  padding-bottom: 0;
}

.bubble-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 900px;
  margin: 0 auto;
}

.bubble {
  max-width: 80%;
  padding: 0.75rem 0.9rem;
  border-radius: 14px;
  font-size: 0.95rem;
  line-height: 1.6;
}

.bubble-user {
  margin-left: auto;
  background: #1a73e8;
  color: #fff;
}

.bubble-assistant {
  margin-right: auto;
  background: #f1f5f9;
  color: #1a202c;
  border: 1px solid #e2e8f0;
}

.bubble-content {
  word-break: break-word;
}

.input-area {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem 1.5rem;
  background: linear-gradient(to top, #f7fafc 80%, transparent);
  z-index: 10;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
}

.input-foot-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 6px;
}

.input-foot-left {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #718096;
  font-size: 0.85rem;
}

.input-foot-dividing-line {
  width: 1px;
  height: 14px;
  background: #e2e8f0;
}

.input-foot-maxlength {
  color: #4a5568;
}

.input-foot-right .clear-btn {
  padding: 4px 10px;
  border: 1px solid #cbd5e0;
  border-radius: 16px;
  background: #f7fafc;
  color: #4a5568;
  font-size: 0.8rem;
  cursor: pointer;
}

.input-foot-right .clear-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
  
  .chat-container {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
  }
}
</style>
