<template>
  <div class="chat-page">
    <div class="chat-header">
      <div class="header-left">
        <div class="logo">
          <span class="logo-icon">🤖</span>
          <span class="logo-text">MateChat</span>
        </div>
        <div class="provider-selector-wrapper">
          <div class="provider-label">模型</div>
          <select v-model="selectedProvider" @change="onProviderChange" class="provider-select">
            <option v-for="provider in providers" :key="provider.id" :value="provider.id">
              {{ provider.name }}
            </option>
          </select>
        </div>
      </div>
      <div class="header-right">
        <button 
          class="header-btn history-btn"
          @click="openHistory = true"
          title="历史记录"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
            <path d="M12 7v5l4 2"/>
          </svg>
        </button>
        <button 
          @click="toggleTTS" 
          class="header-btn tts-btn"
          :class="{ 'active': ttsEnabled, 'speaking': isSpeaking }"
          :title="ttsEnabled ? '关闭语音播报' : '开启语音播报'"
        >
          <svg v-if="ttsEnabled" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 11 15 11 19 16 19 21 15 21 15 9 13 9 18 5"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 11 15 11 19 16 19 21 15 21 15 9 13 9 18 5"/>
            <line x1="23" y1="9" x2="17" y2="15"/>
            <line x1="17" y1="9" x2="23" y2="15"/>
          </svg>
        </button>
        <div class="status-indicator" :class="{ 'online': isOnline }">
          <span class="status-dot"></span>
          <span class="status-text">{{ isOnline ? '在线' : '离线' }}</span>
        </div>
      </div>
    </div>

    <div class="chat-container">
      <div v-if="startPage" class="intro-container">
        <div class="intro-logo-wrapper">
          <div class="intro-logo">🤖</div>
        </div>
        <h1 class="intro-title">MateChat</h1>
        <p class="intro-subtitle">Hi，欢迎使用 MateChat</p>
        <div class="intro-description">
          <p>MateChat 可以辅助研发人员编码、查询知识和相关作业信息、编写文档等。</p>
          <p>作为 AI 模型，提供的答案可能不总是准确，但你的反馈可以帮助我们做得更好。</p>
        </div>
        <div class="intro-prompts">
          <PromptShortcut 
            class="intro-prompt" 
            :list="introPrompt.list" 
            :direction="introPrompt.direction" 
            @itemClick="onSubmit($event.label)" 
          />
        </div>
      </div>

      <div class="messages-wrapper">
        <DynamicScroller
          :items="messages"
          :min-item-size="80"
          class="messages-area"
          ref="dynamicScroller"
          @scroll.native="handleScroll"
        >
          <template #default="{ item, index, active }">
            <DynamicScrollerItem
              :item="item"
              :active="active"
              :size-dependencies="[item.content]"
              :data-index="index"
            >
              <MessageItem :message="item" />
            </DynamicScrollerItem>
          </template>
          
          <template #after>
            <div v-if="isLoading" ref="loadingRef" class="loading-container">
              <div class="loading-bubble">
                <Loader />
              </div>
            </div>
            <div ref="bottomAnchor" class="bottom-anchor"></div>
          </template>
        </DynamicScroller>
      </div>

      <div class="input-container">
        <div class="input-wrapper">
          <div class="input-main">
            <XSender
              v-model="inputText"
              :disabled="isLoading"
              placeholder="输入消息..."
              @submit="sendMessage"
              @autoSubmit="handleAutoSubmit"
            />
          </div>
          <div class="input-footer">
            <div class="footer-left">
              <span class="footer-info">
                <span class="info-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                  </svg>
                  Markdown
                </span>
                <span class="info-divider">|</span>
                <span class="info-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="4" y1="9" x2="20" y2="9"/>
                    <line x1="4" y1="15" x2="20" y2="15"/>
                    <line x1="10" y1="3" x2="8" y2="21"/>
                    <line x1="16" y1="3" x2="14" y2="21"/>
                  </svg>
                  Enter 发送
                </span>
              </span>
              <span class="char-count">{{ inputText.length }}/2000</span>
            </div>
            <div class="footer-right">
              <button 
                class="clear-btn" 
                :disabled="!inputText" 
                @click="inputText = ''"
                :class="{ 'disabled': !inputText }"
              >
                清空
              </button>
            </div>
          </div>
          <div class="shortcut-bar" v-if="!startPage">
            <PromptShortcut 
              :list="simplePrompt" 
              :direction="'horizontal'" 
              @itemClick="onSubmit($event.label)" 
            />
            <button class="new-chat-btn" @click="newConversation">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              新建对话
            </button>
          </div>
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

let audioQueue = []
let isPlayingQueue = false
let ttsRequestQueue = []
let activeTTSRequests = 0
const MAX_CONCURRENT_TTS = 1

async function loadProviders() {
  try {
    const response = await fetch('/api/chat/providers')
    const data = await response.json()
    if (data.providers && data.providers.length > 0) {
      providers.value = data.providers
      // 检查默认提供商是否可用，如果不可用则选择第一个
      if (providers.value.length > 0 && !providers.value.some(p => p.id === selectedProvider.value)) {
        selectedProvider.value = providers.value[0].id
      }
    }
  } catch (error) {
    console.warn('Failed to load providers, using defaults:', error)
  }
}

function onProviderChange() {
  console.log('🔄 切换 AI 模型:', selectedProvider.value)
  stopAllAudio()
}

function toggleTTS() {
  ttsEnabled.value = !ttsEnabled.value
  
  if (!ttsEnabled.value) {
    stopAllAudio()
  }
}

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

function playAudio(audio) {
  return new Promise((resolve, reject) => {
    audio.onended = () => resolve()
    audio.onerror = () => reject(new Error('音频播放失败'))
    audio.play().catch(reject)
  })
}

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
          provider: selectedProvider.value
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
  scrollToBottom()
}

async function sendMessage() {
  const text = inputText.value.trim()
  if (!text || isLoading.value) return

  startPage.value = false
  await sendMessageToAI(text)
  inputText.value = ''
  
  scrollToBottom()
}

async function handleAutoSubmit(text) {
  console.log('🎤 收到自动提交事件，文本:', text)
  if (!text || isLoading.value) {
    console.warn('⚠️ 无法自动提交:', { text, isLoading: isLoading.value })
    return
  }
  await sendMessageToAI(text)
}

async function sendMessageToAI(text) {
  try {
    stopAllAudio()
    
    messages.value.push({
      id: Date.now(),
      role: 'user',
      content: text
    })
    
    scrollToBottom()
    
    const aiMessageId = Date.now() + 1
    messages.value.push({
      id: aiMessageId,
      role: 'assistant',
      content: ''
    })
    
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

    const convId = response.headers.get('X-Conversation-Id')
    if (convId) {
      currentConversationId.value = convId
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let fullResponse = ''
    let lastSentenceEnd = 0
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
    
    if (ttsEnabled.value && lastSentenceEnd < fullResponse.length) {
      const remainingText = fullResponse.substring(lastSentenceEnd).trim()
      if (remainingText.length > 0) {
        console.log('🔊 播放剩余文本:', remainingText)
        textToSpeech(remainingText)
      }
    }
    
    isLoading.value = false
    scrollToBottom()

  } catch (error) {
    console.error('Failed to send message', error)
    isOnline.value = false
    isLoading.value = false
  }
}

const shouldAutoScroll = ref(true)
const bottomAnchor = ref(null)
const loadingRef = ref(null)

function handleScroll(e) {
  const target = e.target || e.srcElement
  if (!target) return
  const { scrollTop, scrollHeight, clientHeight } = target
  shouldAutoScroll.value = scrollHeight - scrollTop - clientHeight < 150
}

function scrollToBottom() {
  if (!shouldAutoScroll.value) return
  
  nextTick(() => {
    if (isLoading.value && loadingRef.value) {
      loadingRef.value.scrollIntoView({ behavior: 'auto', block: 'end' })
      return
    }

    if (dynamicScroller.value) {
      dynamicScroller.value.scrollToBottom()
    }
    
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
    
    scrollToBottom()
  } catch (e) {
    console.error('Failed to load conversation:', e)
  } finally {
    isLoading.value = false
  }
}

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
  height: 100vh;
  @apply bg-background text-foreground;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.5rem;
  @apply bg-card border-border;
  border-bottom: 1px solid;
  backdrop-filter: blur(12px);
  background: hsl(var(--card) / 0.95);
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo-icon {
  font-size: 1.5rem;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  @apply text-foreground;
}

.provider-selector-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  @apply bg-muted border-border;
  border: 1px solid;
  border-radius: 0.5rem;
}

.provider-label {
  font-size: 0.75rem;
  font-weight: 600;
  @apply text-muted-foreground;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.provider-select {
  padding: 0.25rem 0.5rem;
  @apply bg-background text-foreground;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  outline: none;
}

.provider-select:hover {
  @apply bg-accent text-accent-foreground;
}

.provider-select:focus {
  @apply ring-2 ring-primary ring-offset-2;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 0.5rem;
  @apply bg-muted text-muted-foreground;
  cursor: pointer;
  transition: all 0.2s;
}

.header-btn:hover {
  @apply bg-accent text-accent-foreground;
  transform: translateY(-1px);
}

.header-btn:active {
  transform: translateY(0);
}

.tts-btn.active {
  @apply bg-primary text-primary-foreground;
}

.tts-btn.active:hover {
  @apply bg-primary/90;
}

.tts-btn.speaking {
  animation: pulse-speaking 1.5s ease-in-out infinite;
}

@keyframes pulse-speaking {
  0%, 100% { 
    transform: scale(1);
    box-shadow: 0 0 0 0 hsla(var(--primary) / 0.4);
  }
  50% { 
    transform: scale(1.05);
    box-shadow: 0 0 0 8px hsla(var(--primary) / 0);
  }
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  @apply bg-muted border-border;
  border: 1px solid;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  @apply bg-destructive;
  transition: all 0.3s;
}

.status-indicator.online .status-dot {
  @apply bg-green-500;
  box-shadow: 0 0 0 3px hsl(142 76% 36% / 0.3);
}

.status-text {
  @apply text-muted-foreground;
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 100%;
  width: 100%;
  overflow: hidden;
}

.messages-wrapper {
  flex: 1;
  overflow: hidden;
}

.messages-area {
  height: 100%;
  overflow-y: auto;
  padding: 1.5rem;
  padding-bottom: 0;
}

.loading-container {
  padding: 1rem;
  display: flex;
  justify-content: center;
}

.loading-bubble {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 1.5rem;
  @apply bg-muted border-border;
  border: 1px solid;
  border-radius: 1rem;
}

.bottom-anchor {
  height: 1px;
  width: 100%;
}

.intro-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 3rem 1.5rem;
  max-width: 600px;
  margin: 0 auto;
}

.intro-logo-wrapper {
  margin-bottom: 0.5rem;
}

.intro-logo {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%);
  box-shadow: 0 8px 24px hsla(var(--primary) / 0.2);
}

.intro-title {
  font-size: 2rem;
  font-weight: 800;
  @apply text-foreground;
  margin: 0;
  letter-spacing: -0.02em;
}

.intro-subtitle {
  font-size: 1.125rem;
  @apply text-muted-foreground;
  margin: 0;
}

.intro-description {
  @apply text-muted-foreground;
  text-align: center;
  line-height: 1.7;
  margin: 0;
}

.intro-description p {
  margin: 0.5rem 0;
}

.intro-prompts {
  width: 100%;
  margin-top: 1rem;
}

.input-container {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  @apply bg-background/95 backdrop-blur-md;
  border-t: 1px solid hsl(var(--border) / 0.5);
  z-index: 40;
  padding: 1rem 1.5rem;
}

.input-wrapper {
  max-width: 900px;
  margin: 0 auto;
}

.input-main {
  margin-bottom: 0.75rem;
}

.input-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.footer-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  @apply text-muted-foreground;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8125rem;
}

.info-divider {
  @apply text-border;
  opacity: 0.5;
}

.char-count {
  margin-left: auto;
  font-size: 0.8125rem;
  @apply text-muted-foreground;
}

.footer-right .clear-btn {
  padding: 0.375rem 0.875rem;
  @apply border-input bg-muted text-muted-foreground;
  border: 1px solid;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover:not(.disabled) {
  @apply bg-accent text-accent-foreground;
}

.clear-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.shortcut-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.75rem;
}

.new-chat-btn {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  @apply border-input bg-card text-foreground;
  border: 1px solid;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.new-chat-btn:hover {
  @apply bg-accent text-accent-foreground;
  transform: translateY(-1px);
}

.new-chat-btn:active {
  transform: translateY(0);
}

:deep(.markdown-content) h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 1.5rem 0 0.75rem;
  padding-bottom: 0.5rem;
  @apply border-border;
  border-bottom: 1px solid;
}

:deep(.markdown-content) h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 1.25rem 0 0.625rem;
  padding-bottom: 0.375rem;
  @apply border-border;
  border-bottom: 1px solid;
}

:deep(.markdown-content) h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 1rem 0 0.5rem;
}

:deep(.markdown-content) p {
  margin: 0.75rem 0;
  line-height: 1.75;
}

:deep(.markdown-content) code {
  background-color: hsl(var(--muted) / 0.5);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
  font-size: 0.875rem;
}

:deep(.markdown-content) pre {
  background-color: hsl(var(--muted) / 0.3);
  border-radius: 0.5rem;
  padding: 1rem;
  overflow-x: auto;
  margin: 1.25rem 0;
  @apply border-border;
  border: 1px solid;
}

:deep(.markdown-content) pre code {
  background-color: transparent;
  padding: 0;
}

:deep(.markdown-content) ul,
:deep(.markdown-content) ol {
  margin: 0.75rem 0;
  padding-left: 1.5rem;
}

:deep(.markdown-content) li {
  margin: 0.375rem 0;
  line-height: 1.6;
}

:deep(.markdown-content) blockquote {
  border-left: 3px solid hsl(var(--primary) / 0.3);
  padding-left: 1rem;
  margin: 1rem 0;
  @apply text-muted-foreground;
  font-style: italic;
}

:deep(.markdown-content) a {
  color: hsl(var(--primary));
  text-decoration: none;
  border-bottom: 1px solid hsl(var(--primary) / 0.3);
  transition: all 0.2s;
}

:deep(.markdown-content) a:hover {
  color: hsl(var(--primary) / 0.8);
  border-bottom-color: hsl(var(--primary) / 0.8);
}

@media (max-width: 768px) {
  .chat-header {
    padding: 0.625rem 1rem;
  }

  .header-left {
    gap: 0.75rem;
  }

  .logo-text {
    font-size: 1rem;
  }

  .provider-selector-wrapper {
    padding: 0.25rem 0.5rem;
  }

  .provider-label {
    display: none;
  }

  .header-btn {
    width: 36px;
    height: 36px;
  }

  .status-text {
    display: none;
  }

  .messages-area {
    padding: 1rem;
  }

  .intro-container {
    padding: 2rem 1rem;
  }

  .intro-logo {
    width: 64px;
    height: 64px;
    font-size: 2rem;
  }

  .intro-title {
    font-size: 1.5rem;
  }

  .intro-subtitle {
    font-size: 1rem;
  }

  .input-container {
    padding: 0.75rem 1rem;
  }

  .footer-info {
    gap: 0.5rem;
  }

  .info-item {
    font-size: 0.75rem;
  }

  .shortcut-bar {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .new-chat-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>