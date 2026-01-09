<template>
  <div class="chat-page">
    <div class="chat-header">
      <router-link to="/" class="back-button">
        ← 返回首页
      </router-link>
      <h1 class="page-title">💬 AI 智能对话</h1>
      <div class="header-info">
        <!-- AI 模型选择器 -->
        <div class="model-selector">
          <label class="model-label">AI 模型:</label>
          <select v-model="selectedProvider" @change="onProviderChange" class="model-select">
            <option v-for="provider in providers" :key="provider.id" :value="provider.id">
              {{ provider.name }} ({{ provider.model }})
            </option>
          </select>
        </div>
        
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
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Volume2, VolumeX } from 'lucide-vue-next'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { Conversation, ConversationContent } from '@/components/ai-elements/conversation'
import { Message, MessageContent } from '@/components/ai-elements/message'
import { Loader } from '@/components/ai-elements/loader'
import VoiceInput from '@/components/VoiceInput.vue'

const userId = 'user_' + Math.random().toString(36).substr(2, 9)
const isOnline = ref(true)
const selectedProvider = ref('deepseek')
const providers = ref([
  { id: 'deepseek', name: 'DeepSeek', model: 'deepseek-chat' },
  { id: 'qwen', name: '通义千问', model: 'qwen-turbo' }
])

const messages = ref([
  {
    id: Date.now(),
    role: 'assistant',
    content: '嗨呀！✨ 见到你真是太开心啦！我是你的专属 AI 小助手，随时准备为你提供帮助～\n\n不管你想聊什么，问什么，我都会用心倾听、认真回答！💖 有什么想和我分享的吗？'
  }
])

const inputText = ref('')
const isLoading = ref(false)
const ttsEnabled = ref(false)
const isSpeaking = ref(false)

let audioQueue = []
let isPlayingQueue = false
let ttsRequestQueue = []
let activeTTSRequests = 0
const MAX_CONCURRENT_TTS = 1  // 体验版限制，最多同时 1 个请求

// 加载可用的 AI 提供商
async function loadProviders() {
  try {
    const response = await fetch('/api/chat/providers')
    const data = await response.json()
    if (data.providers && data.providers.length > 0) {
      providers.value = data.providers
    }
  } catch (error) {
    console.warn('Failed to load providers, using defaults:', error)
  }
}

// 切换 AI 提供商
function onProviderChange() {
  console.log('🔄 切换 AI 模型:', selectedProvider.value)
  stopAllAudio()
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
        // 继续处理队列
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

// 文本转语音（添加到队列）
async function textToSpeech(text) {
  if (!ttsEnabled.value || !text.trim()) return
  
  // 创建 TTS 任务并添加到队列
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
          voice: 'xiaoxian',  // 使用小贤音色
          speechRate: 150      // 语速 150
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
  
  // 添加到队列
  ttsRequestQueue.push(ttsTask)
  
  // 开始处理队列
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

// 发送消息到 AI
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

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        message: text,
        provider: selectedProvider.value
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
  loadProviders()
  
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
.chat-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px);
  background: #f7fafc;
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

.page-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2d3748;
  margin: 0;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.model-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f7fafc;
  border-radius: 0.5rem;
}

.model-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #4a5568;
}

.model-select {
  padding: 0.25rem 0.5rem;
  border: 1px solid #cbd5e0;
  border-radius: 0.375rem;
  background: white;
  color: #2d3748;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.model-select:hover {
  border-color: #4299e1;
}

.model-select:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
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
</style>
