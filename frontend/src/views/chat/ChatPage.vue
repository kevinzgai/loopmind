<template>
  <div class="flex flex-col h-screen bg-background text-foreground">
    <!-- Header -->
    <header class="sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-card/80 backdrop-blur-md border-b border-border">
      <div class="flex items-center gap-6">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white shadow-glow">
            <Bot class="w-5 h-5" />
          </div>
          <span class="text-xl font-bold font-heading">MateChat</span>
        </div>
        <Select v-model="selectedProvider" @update:model-value="onProviderChange">
          <SelectTrigger class="w-[160px] h-9 bg-muted border-border hover:bg-muted/80">
            <SelectValue placeholder="选择模型">
              <div class="flex items-center gap-2">
                <Sparkles class="w-4 h-4 text-primary" />
                <span class="font-medium">{{ getProviderName(selectedProvider) }}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent class="min-w-[180px]">
            <SelectItem 
              v-for="provider in providers" 
              :key="provider.id" 
              :value="provider.id"
              class="cursor-pointer">
              <div class="flex items-center gap-2">
                <Sparkles class="w-4 h-4 text-primary" />
                <span>{{ provider.name }}</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="flex items-center gap-2">
        <button 
          @click="openHistory = true"
          class="w-10 h-10 flex items-center justify-center rounded-lg bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all cursor-pointer active:scale-95"
          title="历史记录">
          <History class="w-5 h-5" />
        </button>
        <button 
          @click="toggleTTS" 
          :class="[
            'w-10 h-10 flex items-center justify-center rounded-lg transition-all cursor-pointer active:scale-95',
            ttsEnabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
          ]"
          :title="ttsEnabled ? '关闭语音播报' : '开启语音播报'">
          <Volume2 v-if="ttsEnabled" class="w-5 h-5" />
          <VolumeX v-else class="w-5 h-5" />
        </button>
        <div class="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full text-sm font-medium">
          <span 
            :class="[
              'w-2 h-2 rounded-full transition-all',
              isOnline ? 'bg-green-500 shadow-[0_0_0_3px_rgba(34,197,94,0.3)]' : 'bg-red-500'
            ]">
          </span>
          <span class="text-muted-foreground hidden sm:inline">{{ isOnline ? '在线' : '离线' }}</span>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Intro / Welcome Screen -->
      <div v-if="startPage" class="flex-1 flex flex-col items-center justify-center gap-6 px-6 py-12 max-w-2xl mx-auto text-center">
        <div class="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-glow-lg">
          <Bot class="w-10 h-10 text-white" />
        </div>
        <div>
          <h1 class="text-3xl font-extrabold font-heading tracking-tight mb-2">MateChat</h1>
          <p class="text-lg text-muted-foreground">Hi，欢迎使用 MateChat</p>
        </div>
        <p class="text-muted-foreground leading-relaxed max-w-md">
          MateChat 可以辅助研发人员编码、查询知识和相关作业信息、编写文档等。
          <br />
          作为 AI 模型，提供的答案可能不总是准确，但你的反馈可以帮助我们做得更好。
        </p>
        <div class="w-full mt-4">
          <PromptShortcut 
            :list="introPrompt.list" 
            :direction="introPrompt.direction" 
            @itemClick="onSubmit($event.label)" 
          />
        </div>
      </div>

      <!-- Messages Area -->
      <div class="flex-1 overflow-hidden">
        <DynamicScroller
          :items="messages"
          :min-item-size="80"
          class="h-full overflow-y-auto px-6 py-4"
          ref="dynamicScroller"
          @scroll.native="handleScroll">
          <template #default="{ item, index, active }">
            <DynamicScrollerItem
              :item="item"
              :active="active"
              :size-dependencies="[item.content]"
              :data-index="index">
              <MessageItem :message="item" />
            </DynamicScrollerItem>
          </template>
          
          <template #after>
            <!-- Loading Indicator -->
            <div v-if="isLoading" ref="loadingRef" class="flex items-start gap-3 w-full mb-6">
              <div class="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center flex-shrink-0">
                <Bot class="w-5 h-5 text-primary" />
              </div>
              <div class="bg-card border border-border rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                <div class="flex items-center gap-1">
                  <span class="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style="animation-delay: 0ms;"></span>
                  <span class="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style="animation-delay: 150ms;"></span>
                  <span class="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style="animation-delay: 300ms;"></span>
                </div>
              </div>
            </div>
            <div ref="bottomAnchor" class="h-px w-full"></div>
          </template>
        </DynamicScroller>
      </div>

      <!-- Input Area -->
      <div class="sticky bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border px-6 py-4">
        <div class="max-w-3xl mx-auto">
          <div class="mb-3">
            <XSender
              v-model="inputText"
              :disabled="isLoading"
              placeholder="输入消息..."
              @submit="sendMessage"
              @autoSubmit="handleAutoSubmit"
            />
          </div>
          <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-4 flex-1">
              <div class="flex items-center gap-2 text-sm text-muted-foreground">
                <span class="flex items-center gap-1">
                  <FileText class="w-3.5 h-3.5" />
                  Markdown
                </span>
                <span class="text-border opacity-50">|</span>
                <span class="flex items-center gap-1">
                  <Send class="w-3.5 h-3.5" />
                  Enter 发送
                </span>
              </div>
              <span class="text-sm text-muted-foreground ml-auto">{{ inputText.length }}/2000</span>
            </div>
            <button 
              :disabled="!inputText" 
              @click="inputText = ''"
              :class="[
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer',
                inputText ? 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary' : 'bg-muted text-muted-foreground opacity-50 cursor-not-allowed'
              ]">
              清空
            </button>
          </div>
          <div v-if="!startPage" class="flex items-center gap-4 mt-3">
            <PromptShortcut 
              :list="simplePrompt" 
              direction="horizontal" 
              @itemClick="onSubmit($event.label)" 
            />
            <button 
              @click="newConversation"
              class="ml-auto flex items-center gap-1.5 px-4 py-2 bg-muted text-foreground rounded-full text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer">
              <Plus class="w-4 h-4" />
              新建对话
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- History Drawer -->
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
import XSender from '@/components/chat/XSender.vue'
import ChatHistoryDrawer from '@/components/chat/ChatHistoryDrawer.vue'
import PromptShortcut from '@/components/chat/PromptShortcut.vue'
import MessageItem from '@/components/chat/MessageItem.vue'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Bot, History, Volume2, VolumeX, Plus, FileText, Send, Sparkles } from 'lucide-vue-next'

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

const getProviderName = (id) => {
  const provider = providers.value.find(p => p.id === id)
  return provider ? provider.name : '选择模型'
}

const messages = ref([])
const currentConversationId = ref(null)

const inputText = ref('')
const isLoading = ref(false)
const ttsEnabled = ref(false)
const isSpeaking = ref(false)

const introPrompt = {
  direction: 'horizontal',
  list: [
    { value: 'quickSort', label: '帮我写一个快速排序', icon: 'code', desc: '使用 js 实现一个快速排序' },
    { value: 'helpMd', label: '你可以帮我做些什么？', icon: 'help', desc: '了解当前大模型可以帮你做的事' },
    { value: 'bindProjectSpace', label: '怎么绑定项目空间', icon: 'link', desc: '如何绑定云空间中的项目' }
  ]
}
const simplePrompt = [
  { value: 'quickSort', icon: 'code', label: '帮我写一个快速排序' },
  { value: 'helpMd', icon: 'help', label: '你可以帮我做些什么？' },
  { value: 'bindProjectSpace', icon: 'link', label: '怎么绑定项目空间' }
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
      if (providers.value.length > 0 && !providers.value.some(p => p.id === selectedProvider.value)) {
        selectedProvider.value = providers.value[0].id
      }
    }
  } catch (error) {
    // 忽略加载失败，使用默认值
  }
}

function onProviderChange() {
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
        // 忽略 TTS 任务失败
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
        // 忽略播放失败
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
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, provider: selectedProvider.value })
      })
      if (!response.ok) throw new Error('TTS 请求失败')
      const blob = await response.blob()
      const audioUrl = URL.createObjectURL(blob)
      const audio = new Audio(audioUrl)
      audioQueue.push(audio)
      playAudioQueue()
    } catch (error) {
      // 忽略 TTS 转换失败
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
  if (!text || isLoading.value) return
  await sendMessageToAI(text)
}

async function sendMessageToAI(text) {
  try {
    stopAllAudio()
    messages.value.push({ id: Date.now(), role: 'user', content: text })
    scrollToBottom()
    const aiMessageId = Date.now() + 1
    messages.value.push({ id: aiMessageId, role: 'assistant', content: '' })
    shouldAutoScroll.value = true
    scrollToBottom()
    isLoading.value = true

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        message: text,
        provider: selectedProvider.value,
        conversationId: currentConversationId.value
      })
    })

    if (!response.ok) throw new Error('Request failed')
    const convId = response.headers.get('X-Conversation-Id')
    if (convId) currentConversationId.value = convId

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
        scrollToBottom()
      }
      if (ttsEnabled.value) {
        const sentenceEndRegex = /[。！？.!?]+/g
        let match
        while ((match = sentenceEndRegex.exec(fullResponse)) !== null) {
          const endIndex = match.index + match[0].length
          if (endIndex > lastSentenceEnd) {
            const sentence = fullResponse.substring(lastSentenceEnd, endIndex).trim()
            if (sentence.length > 0) textToSpeech(sentence)
            lastSentenceEnd = endIndex
          }
        }
      }
    }
    
    if (ttsEnabled.value && lastSentenceEnd < fullResponse.length) {
      const remainingText = fullResponse.substring(lastSentenceEnd).trim()
      if (remainingText.length > 0) textToSpeech(remainingText)
    }
    isLoading.value = false
    scrollToBottom()
  } catch (error) {
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
    if (dynamicScroller.value) dynamicScroller.value.scrollToBottom()
    if (bottomAnchor.value) bottomAnchor.value.scrollIntoView({ behavior: 'auto', block: 'end' })
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
    const q = new URLSearchParams({ userId, provider: selectedProvider.value, conversationId })
    const res = await fetch(`/api/chat/history?${q.toString()}`)
    const data = await res.json()
    messages.value = Array.isArray(data.messages) ? data.messages : []
    currentConversationId.value = conversationId
    startPage.value = false
    scrollToBottom()
  } catch (e) {
    // 忽略加载会话失败
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadProviders()
  fetch('/api/health')
    .then(res => res.json())
    .then(() => { isOnline.value = true })
    .catch(() => { isOnline.value = false })
})
</script>

<style scoped>
.gradient-primary {
  background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%);
}

.shadow-glow {
  box-shadow: 0 0 20px hsl(var(--primary) / 0.3);
}

.shadow-glow-lg {
  box-shadow: 0 0 30px hsl(var(--primary) / 0.4);
}
</style>
