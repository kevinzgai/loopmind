<template>
  <div class="app-container">
    <!-- 测试模式切换按钮组 -->
    <div class="test-button-container">
      <button
        @click="currentMode = 'chat'"
        class="test-button"
        :class="{ 'active': currentMode === 'chat' }"
      >
        💬 聊天模式
      </button>
      <button
        @click="currentMode = 'audioTest'"
        class="test-button"
        :class="{ 'active': currentMode === 'audioTest' }"
      >
        🎤 录音测试
      </button>
      <button
        @click="currentMode = 'seedAsrTest'"
        class="test-button"
        :class="{ 'active': currentMode === 'seedAsrTest' }"
      >
        🤖 Seed-ASR 测试
      </button>
      <button
        @click="currentMode = 'ttsTest'"
        class="test-button"
        :class="{ 'active': currentMode === 'ttsTest' }"
      >
        🔊 TTS 测试
      </button>
    </div>

    <!-- 录音测试组件 -->
    <AudioTestDemo v-if="currentMode === 'audioTest'" />
    
    <!-- Seed-ASR 测试组件 -->
    <SeedAsrTestDemo v-else-if="currentMode === 'seedAsrTest'" />
    
    <!-- TTS 测试组件 -->
    <TtsTestDemo v-else-if="currentMode === 'ttsTest'" />

    <!-- 聊天界面 -->
    <div v-else>
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

<script>
import { computed, ref, watch } from 'vue'
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
import AudioTestDemo from './components/AudioTestDemo.vue'
import SeedAsrTestDemo from './components/SeedAsrTestDemo.vue'
import TtsTestDemo from './components/TtsTestDemo.vue'

export default {
  name: 'App',
  components: {
    Conversation,
    ConversationContent,
    Message,
    MessageContent,
    Loader,
    PromptInput,
    PromptInputTextarea,
    PromptInputSubmit,
    PromptInputSpeechButton,
    Send,
    AudioTestDemo,
    SeedAsrTestDemo,
    TtsTestDemo,
  },
  setup() {
    const userId = 'user_' + Math.random().toString(36).substr(2, 9)
    const currentMode = ref('chat') // 'chat', 'audioTest', 'seedAsrTest', 'ttsTest'
    
    const { completion, input, handleSubmit, isLoading, complete, setCompletion } = useCompletion({
      api: '/api/chat',
      streamProtocol: 'text',
      body: {
        userId
      },
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const messages = ref([
      {
        id: Date.now(),
        role: 'assistant',
        content: '你好！我是AI助手，有什么我可以帮助你的吗？'
      }
    ])

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
          await complete(text)
        } catch (error) {
          console.error('Failed to send message', error)
        }
      },
      onError: (error) => {
        console.error(`Input error (${error.code})`, error.message)
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
    
    return {
      messages,
      isLoading,
      renderMessageContent,
      currentMode,
    }
  }
}
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 1.5rem;
}

.test-button-container {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.test-button {
  padding: 0.75rem 1.5rem;
  background-color: #8b5cf6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.test-button:hover {
  background-color: #7c3aed;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.test-button:active {
  transform: translateY(0);
}

.test-button.active {
  background-color: #10b981;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.test-button.active:hover {
  background-color: #059669;
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

:deep(.markdown-content) ul,
:deep(.markdown-content) ol {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

:deep(.markdown-content) li {
  margin: 0.25rem 0;
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

:deep(.markdown-content) blockquote {
  border-left: 4px solid #cbd5e1;
  padding-left: 1rem;
  margin: 1rem 0;
  color: #64748b;
}

:deep(.markdown-content) a {
  color: #6366f1;
  text-decoration: underline;
}

:deep(.markdown-content) a:hover {
  color: #4f46e5;
}

:deep(.markdown-content) table {
  border-collapse: collapse;
  width: 100%;
  margin: 1rem 0;
}

:deep(.markdown-content) th,
:deep(.markdown-content) td {
  border: 1px solid #cbd5e1;
  padding: 0.5rem;
  text-align: left;
}

:deep(.markdown-content) th {
  background-color: #f1f5f9;
  font-weight: bold;
}

:deep(.markdown-content) tr:nth-child(even) {
  background-color: #f8fafc;
}
</style>
