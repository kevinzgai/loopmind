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
        <span class="status-badge" :class="{ 'online': isOnline }">
          {{ isOnline ? '● 在线' : '○ 离线' }}
        </span>
      </div>
    </div>

    <div class="chat-container">
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

      <PromptInput>
        <PromptInputTextarea placeholder="输入你的消息..." />
        <PromptInputSpeechButton />
        <PromptInputSubmit>
          <Send :size="20" />
        </PromptInputSubmit>
      </PromptInput>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { Send } from 'lucide-vue-next'
import { useCompletion } from '@ai-sdk/vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { Conversation, ConversationContent } from '@/components/ai-elements/conversation'
import { Message, MessageContent } from '@/components/ai-elements/message'
import { Loader } from '@/components/ai-elements/loader'
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
  PromptInputSpeechButton,
  usePromptInputProvider,
} from '@/components/ai-elements/prompt-input'

const userId = 'user_' + Math.random().toString(36).substr(2, 9)
const isOnline = ref(true)
const selectedProvider = ref('deepseek')
const providers = ref([
  { id: 'deepseek', name: 'DeepSeek', model: 'deepseek-chat' },
  { id: 'qwen', name: '通义千问', model: 'qwen-turbo' }
])

const { completion, input, handleSubmit, isLoading, complete, setCompletion } = useCompletion({
  api: '/api/chat',
  streamProtocol: 'text',
  body: {
    userId,
    provider: selectedProvider.value
  },
  headers: {
    'Content-Type': 'application/json'
  }
})

const messages = ref([
  {
    id: Date.now(),
    role: 'assistant',
    content: '你好！我是 AI 助手，有什么我可以帮助你的吗？'
  }
])

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
  // 清空当前对话（可选）
  // messages.value = [
  //   {
  //     id: Date.now(),
  //     role: 'assistant',
  //     content: '你好！我是 AI 助手，有什么我可以帮助你的吗？'
  //   }
  // ]
}

watch(completion, (newCompletion) => {
  if (newCompletion) {
    const lastMessage = messages.value[messages.value.length - 1]
    if (lastMessage && lastMessage.role === 'assistant') {
      lastMessage.content = newCompletion
    }
  }
})

const promptInput = usePromptInputProvider({
  onSubmit: async (message) => {
    const text = message.text?.trim()
    if (!text) return

    try {
      messages.value.push({
        id: Date.now(),
        role: 'user',
        content: text
      })
      messages.value.push({
        id: Date.now() + 1,
        role: 'assistant',
        content: ''
      })
      setCompletion('')
      
      // 发送请求时包含选中的 provider
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

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        fullResponse += chunk
        setCompletion(fullResponse)
      }
    } catch (error) {
      console.error('Failed to send message', error)
      isOnline.value = false
    }
  },
  onError: (error) => {
    console.error(`Input error (${error.code})`, error.message)
    isOnline.value = false
  },
})

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
  // 加载可用的 AI 提供商
  loadProviders()
  
  // 检查后端连接
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

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 1.5rem;
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
