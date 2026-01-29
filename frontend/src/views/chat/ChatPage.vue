<template>
  <div class="chat-page">
    <div class="assistant-header">
      <div class="assistant-title">AI 助手</div>
      <div class="assistant-actions">
        <div class="model-selector">
          <select v-model="selectedProvider" @change="onProviderChange" class="model-select">
            <option v-for="provider in providers" :key="provider.id" :value="provider.id">
              {{ provider.name }} ({{ provider.model }})
            </option>
          </select>
        </div>
        <button class="history-btn" @click="openHistory = true">历史</button>
        <button 
          @click="toggleTTS" 
          class="tts-toggle-btn"
          :class="{ 'active': ttsEnabled, 'speaking': isSpeaking }"
          :title="ttsEnabled ? '关闭语音播报' : '开启语音播报'"
        >
          <Volume2 v-if="ttsEnabled" :size="18" />
          <VolumeX v-else :size="18" />
        </button>
        <span class="status-badge" :class="{ 'online': isOnline }">
          {{ isOnline ? '● 在线' : '○ 离线' }}
        </span>
      </div>
    </div>

    <div class="chat-container">
      <div v-if="startPage" class="intro-container">
        <div class="intro-logo">
          <div class="intro-logo-mark">🤖</div>
        </div>
        <div class="intro-title">MateChat</div>
        <div class="intro-subtitle">Hi，欢迎使用 MateChat</div>
        <div class="intro-desc">
          <p>MateChat 可以辅助研发人员编码、查询知识和相关作业信息、编写文档等。</p>
          <p>作为 AI 模型，提供的答案可能不总是准确，但你的反馈可以帮助我们做得更好。</p>
        </div>
        <PromptShortcut class="intro-prompt" :list="introPrompt.list" :direction="introPrompt.direction" @itemClick="onSubmit($event.label)" />
      </div>
      <!-- 消息列表区域 -->
      <DynamicScroller
        :items="messages"
        :min-item-size="50"
        class="messages-area"
        ref="dynamicScroller"
        @scroll.native="handleScroll"
      >
        <template #default="{ item, index, active }">
          <DynamicScrollerItem
            :item="item"
            :active="active"
            :size-dependencies="[
              item.content,
            ]"
            :data-index="index"
          >
            <MessageItem :message="item" />
          </DynamicScrollerItem>
        </template>
        
        <template #after>
           <div v-if="isLoading" ref="loadingRef" class="bubble bubble-assistant loading-bubble" style="margin: 1.5rem;">
             <div class="bubble-content">
               <Loader />
             </div>
           </div>
           <div ref="bottomAnchor" style="height: 1px; width: 100%;"></div>
         </template>
      </DynamicScroller>

      <!-- 固定在底部的输入框 -->
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
            <span v-for="(item, index) in inputFootIcons" :key="index">
              <i>{{ item.icon }}</i>
              {{ item.text }}
            </span>
            <span class="input-foot-dividing-line"></span>
            <span class="input-foot-maxlength">{{ inputText.length }}/2000</span>
          </div>
          <div class="input-foot-right">
            <button class="clear-btn" :disabled="!inputText" @click="inputText = ''">清空输入</button>
          </div>
        </div>
        <div class="shortcut" v-if="!startPage">
          <PromptShortcut :list="simplePrompt" :direction="'horizontal'" @itemClick="onSubmit($event.label)" />
          <button class="new-conv-btn" @click="newConversation">新建对话</button>
        </div>
      </div>
    </div>
    <ChatHistoryDrawer 
      :open="openHistory" 
      :user-id="userId" 
      :provider="selectedProvider" 
      @close="openHistory = false" 
      @select-conversation="onSelectConversation"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { Volume2, VolumeX } from 'lucide-vue-next'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { Loader } from '@/components/ai-elements/loader'
import XSender from '@/components/chat/XSender.vue'
import ChatHistoryDrawer from '@/components/chat/ChatHistoryDrawer.vue'
import PromptShortcut from '@/components/chat/PromptShortcut.vue'
import MessageItem from '@/components/chat/MessageItem.vue'

const userId = 'user_' + Math.random().toString(36).substr(2, 9)
const isOnline = ref(true)
const selectedProvider = ref('deepseek')
const providers = ref([
  { id: 'deepseek', name: 'DeepSeek', model: 'deepseek-chat' },
  { id: 'qwen', name: '通义千问', model: 'qwen-turbo' }
])
const openHistory = ref(false)
const startPage = ref(true)
const dynamicScroller = ref(null)

const messages = ref([])
// 当前会话 ID
const currentConversationId = ref(null)

const inputText = ref('')
const isLoading = ref(false)
const ttsEnabled = ref(false)
const isSpeaking = ref(false)


const introPrompt = {
  direction: 'horizontal',
  list: [
    { value: 'quickSort', label: '帮我写一个快速排序', icon: '💡', desc: '使用 js 实现一个快速排序' },
    { value: 'helpMd', label: '你可以帮我做些什么？', icon: '⭐', desc: '了解当前大模型可以帮你做的事' },
    { value: 'bindProjectSpace', label: '怎么绑定项目空间', icon: '📌', desc: '如何绑定云空间中的项目' }
  ]
}
const simplePrompt = [
  { value: 'quickSort', icon: '💡', label: '帮我写一个快速排序' },
  { value: 'helpMd', icon: '⭐', label: '你可以帮我做些什么？' },
  { value: 'bindProjectSpace', icon: '📌', label: '怎么绑定项目空间' }
]
const inputFootIcons = [
  { icon: '📝', text: '支持 Markdown' },
  { icon: '⌨️', text: 'Enter 发送' }
]

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
          text: text
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

  // 滚动到底部
  scrollToBottom()
}

// 发送消息
async function sendMessage() {
  const text = inputText.value.trim()
  if (!text || isLoading.value) return

  startPage.value = false
  await sendMessageToAI(text)
  inputText.value = ''
  
  // 滚动到底部
  scrollToBottom()
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
    
    // 立即滚动
    scrollToBottom()
    
    const aiMessageId = Date.now() + 1
    messages.value.push({
      id: aiMessageId,
      role: 'assistant',
      content: ''
    })
    
    // 再次滚动以显示新消息气泡
    shouldAutoScroll.value = true
    scrollToBottom()
    
    isLoading.value = true

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        message: text,
        provider: selectedProvider.value,
        conversationId: currentConversationId.value
      })
    })

    if (!response.ok) {
      throw new Error('Request failed')
    }

    // 获取并保存 conversationId
    const convId = response.headers.get('X-Conversation-Id')
    if (convId) {
      currentConversationId.value = convId
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let fullResponse = ''
    let lastSentenceEnd = 0
    // 用于控制流式输出时的滚动频率
    let scrollThrottle = 0 

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      fullResponse += chunk
      
      const lastMessage = messages.value[messages.value.length - 1]
      if (lastMessage && lastMessage.role === 'assistant') {
        lastMessage.content = fullResponse
        scrollToBottom()
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
    
    // 确保滚动到底部
    scrollToBottom()

  } catch (error) {
    console.error('Failed to send message', error)
    isOnline.value = false
    isLoading.value = false
  }
}

// 滚动到底部
const shouldAutoScroll = ref(true)

const bottomAnchor = ref(null)
const loadingRef = ref(null)

function handleScroll(e) {
  const target = e.target || e.srcElement
  if (!target) return
  const { scrollTop, scrollHeight, clientHeight } = target
  // 如果距离底部小于 150px，则开启自动滚动
  shouldAutoScroll.value = scrollHeight - scrollTop - clientHeight < 150
}

function scrollToBottom() {
  if (!shouldAutoScroll.value) return
  
  nextTick(() => {
    // 优先滚动到 Loading 元素
    if (isLoading.value && loadingRef.value) {
      loadingRef.value.scrollIntoView({ behavior: 'auto', block: 'end' })
      return
    }

    // 其次使用 DynamicScroller 的方法
    if (dynamicScroller.value) {
      dynamicScroller.value.scrollToBottom()
    }
    
    // 作为双重保险，滚动锚点元素
    if (bottomAnchor.value) {
      bottomAnchor.value.scrollIntoView({ behavior: 'auto', block: 'end' })
    }
  })
}

function onSubmit(val) {
  inputText.value = val
  sendMessage()
}

function newConversation() {
  startPage.value = true
  messages.value = []
  currentConversationId.value = null
}

async function onSelectConversation(conversationId) {
  openHistory.value = false
  isLoading.value = true
  try {
    const q = new URLSearchParams({ 
        userId, 
        provider: selectedProvider.value,
        conversationId
    })
    const res = await fetch(`/api/chat/history?${q.toString()}`)
    const data = await res.json()
    
    messages.value = Array.isArray(data.messages) ? data.messages : []
    currentConversationId.value = conversationId
    startPage.value = false
    
    // 滚动到底部
    scrollToBottom()
  } catch (e) {
    console.error('Failed to load conversation:', e)
  } finally {
    isLoading.value = false
  }
}

// 不再需要在 ChatPage 中渲染 markdown，移至 MessageItem 组件
const renderMessageContent = (content) => {
  return content
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

.scroller {
  height: 100%;
}

.assistant-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.assistant-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #2d3748;
}
.assistant-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.model-selector {
  display: flex;
  align-items: center;
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

.history-btn {
  padding: 0.25rem 0.6rem;
  border: 1px solid #cbd5e0;
  border-radius: 6px;
  background: #f7fafc;
  color: #4a5568;
  font-size: 0.875rem;
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
.intro-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 2rem 0 0;
}
.intro-logo img {
  width: 72px;
  height: 72px;
}
.intro-logo-mark {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  background: linear-gradient(135deg, #edf2f7 0%, #e2e8f0 100%);
  border: 1px solid #e2e8f0;
}
.intro-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2d3748;
}
.intro-subtitle {
  color: #4a5568;
}
.intro-desc {
  color: #718096;
  text-align: center;
}
.intro-prompt {
  margin-top: 8px;
}

.bubble-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
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
}
.shortcut {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}
.new-conv-btn {
  margin-left: auto;
  padding: 6px 10px;
  border: 1px solid #cbd5e0;
  border-radius: 999px;
  background: #fff;
  color: #2d3748;
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
