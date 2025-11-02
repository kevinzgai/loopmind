<template>
  <div class="flex flex-col h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
    <!-- 聊天头部 -->
    <div class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg py-4 px-6 flex items-center">
      <div class="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-4">
        <span class="text-xl">🤖</span>
      </div>
      <div>
        <h1 class="text-xl font-bold">AI聊天助手</h1>
        <p class="text-sm opacity-90">随时为您解答问题</p>
      </div>
      <div class="ml-auto">
        <button 
          @click="clearMessages" 
          class="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-200 text-sm font-medium"
        >
          清屏
        </button>
      </div>
    </div>

    <!-- 消息区域 -->
    <div 
      ref="messagesContainer"
      class="flex-1 overflow-y-auto p-4 space-y-4"
    >
      <div 
        v-for="message in messages" 
        :key="message.id" 
        :class="[
          'flex',
          message.type === 'user' ? 'justify-end' : 'justify-start'
        ]"
      >
        <!-- AI消息 -->
        <div 
          v-if="message.type === 'ai'" 
          class="flex max-w-3/4"
        >
          <div class="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center mr-2">
            <span class="text-white">🤖</span>
          </div>
          <div class="bg-white rounded-2xl rounded-tl-none shadow-md p-4">
            <div class="font-semibold text-sm text-gray-700 mb-1">AI助手</div>
            <div 
              class="text-gray-800 markdown-content"
              v-html="renderMessageContent(message.content)"
            ></div>
            <div class="text-xs text-gray-500 mt-2">
              {{ formatTime(message.timestamp) }}
            </div>
          </div>
        </div>

        <!-- 用户消息 -->
        <div 
          v-else
          class="flex max-w-3/4"
        >
          <div class="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl rounded-br-none shadow-md p-4">
            <div class="font-semibold text-sm text-white mb-1">你</div>
            <div class="text-white">
              {{ message.content }}
            </div>
            <div class="text-xs text-indigo-200 mt-2">
              {{ formatTime(message.timestamp) }}
            </div>
          </div>
          <div class="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 flex items-center justify-center ml-2">
            <span class="text-white">👤</span>
          </div>
        </div>
      </div>

      <!-- 正在输入指示器 -->
      <div 
        v-if="loading" 
        class="flex justify-start"
      >
        <div class="flex max-w-3/4">
          <div class="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center mr-2">
            <span class="text-white">🤖</span>
          </div>
          <div class="bg-white rounded-2xl rounded-tl-none shadow-md p-4">
            <div class="font-semibold text-sm text-gray-700 mb-1">AI助手</div>
            <div class="flex space-x-1">
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s;"></div>
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.4s;"></div>
            </div>
          </div>
        </div>
      </div>

      <div ref="messagesEndRef"></div>
    </div>

    <!-- 输入区域 -->
    <div class="bg-white border-t border-gray-200 p-4">
      <div class="flex items-end space-x-2">
        <textarea
          v-model="inputValue"
          @keypress="handleKeyPress"
          placeholder="输入你的消息..."
          :disabled="loading"
          rows="1"
          class="flex-1 border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
        ></textarea>
        <button 
          @click="handleSend" 
          :disabled="loading || !inputValue.trim()"
          :class="[
            'h-12 w-12 rounded-full flex items-center justify-center transition-all duration-200',
            loading || !inputValue.trim() 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg'
          ]"
        >
          <svg v-if="loading" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else class="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

export default {
  name: 'App',
  setup() {
    const messages = ref([])
    const inputValue = ref('')
    const loading = ref(false)
    const messagesContainer = ref(null)
    const messagesEndRef = ref(null)
    
    // 生成简单的用户ID（在实际应用中，你可能想要更复杂的用户管理）
    const userId = 'user_' + Math.random().toString(36).substr(2, 9)
    
    // 添加欢迎消息
    onMounted(() => {
      messages.value = [
        {
          id: Date.now(),
          type: 'ai',
          content: '你好！我是AI助手，有什么我可以帮助你的吗？',
          timestamp: new Date(),
        },
      ]
      
      // 滚动到消息底部
      scrollToBottom()
    })
    
    // 清屏功能
    const clearMessages = () => {
      messages.value = [
        {
          id: Date.now(),
          type: 'ai',
          content: '对话已清空。有什么我可以帮助你的吗？',
          timestamp: new Date(),
        },
      ]
    }
    
    // 改进的Markdown到HTML转换函数
    const markdownToHtml = (markdown) => {
      if (!markdown) return ''
      
      try {
        // 配置marked选项
        marked.setOptions({
          gfm: true,
          breaks: true,
          smartLists: true,
          smartypants: true,
        })
        
        // 使用marked解析Markdown
        let html = marked.parse(markdown)
        
        // 使用DOMPurify清理HTML以防止XSS攻击
        html = DOMPurify.sanitize(html)
        
        return html
      } catch (error) {
        console.warn('Markdown conversion failed:', error)
        return markdown
      }
    }
    
    // 滚动到消息底部
    const scrollToBottom = () => {
      nextTick(() => {
        if (messagesEndRef.value) {
          messagesEndRef.value.scrollIntoView({ behavior: 'smooth' })
        }
      })
    }
    
    // 格式化时间
    const formatTime = (date) => {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    
    // 渲染消息内容
    const renderMessageContent = (content) => {
      return markdownToHtml(content)
    }
    
    // 发送消息
    const handleSend = async () => {
      if (!inputValue.value.trim() || loading.value) return
      
      const userMessage = {
        id: Date.now(),
        type: 'user',
        content: inputValue.value,
        timestamp: new Date(),
      }
      
      // 添加用户消息
      messages.value.push(userMessage)
      scrollToBottom()
      
      // 清空输入框并设置加载状态
      const userInput = inputValue.value
      inputValue.value = ''
      loading.value = true
      
      try {
        // 创建流式响应
        const response = await fetch('/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: userInput, userId, stream: true }),
        })
        
        if (response.ok) {
          // 获取响应流
          const reader = response.body.getReader()
          const decoder = new TextDecoder('utf-8')
          
          // 创建AI消息
          const aiMessageId = Date.now() + 1
          let accumulatedContent = ''
          
          // 添加临时AI消息
          const tempAiMessage = {
            id: aiMessageId,
            type: 'ai',
            content: '',
            timestamp: new Date(),
          }
          
          messages.value.push(tempAiMessage)
          scrollToBottom()
          
          // 逐块读取响应
          while (true) {
            const { done, value } = await reader.read()
            
            if (done) {
              // 完成后移除加载状态
              loading.value = false
              break
            }
            
            // 将字节转换为文本
            const chunk = decoder.decode(value, { stream: true })
            accumulatedContent += chunk
            
            // 更新AI消息内容
            const aiMessageIndex = messages.value.findIndex(msg => msg.id === aiMessageId)
            if (aiMessageIndex !== -1) {
              messages.value[aiMessageIndex].content = accumulatedContent
              scrollToBottom()
            }
          }
        } else {
          // 添加错误消息
          const errorMessage = {
            id: Date.now(),
            type: 'ai',
            content: '抱歉，发送消息时出现错误。',
            timestamp: new Date(),
          }
          
          messages.value.push(errorMessage)
          scrollToBottom()
          loading.value = false
        }
      } catch (error) {
        console.error('Error:', error)
        
        // 添加错误消息
        const errorMessage = {
          id: Date.now(),
          type: 'ai',
          content: '抱歉，发送消息时出现错误。',
          timestamp: new Date(),
        }
        
        messages.value.push(errorMessage)
        scrollToBottom()
        loading.value = false
      }
    }
    
    // 处理键盘事件
    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    }
    
    return {
      messages,
      inputValue,
      loading,
      messagesContainer,
      messagesEndRef,
      handleSend,
      handleKeyPress,
      renderMessageContent,
      formatTime,
      clearMessages
    }
  }
}
</script>

<style scoped>
/* Markdown内容样式 */
.markdown-content h1 {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 1rem 0;
  padding-bottom: 0.3rem;
  border-bottom: 1px solid #e2e8f0;
}

.markdown-content h2 {
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0.8rem 0;
  padding-bottom: 0.2rem;
  border-bottom: 1px solid #e2e8f0;
}

.markdown-content h3 {
  font-size: 1.1rem;
  font-weight: bold;
  margin: 0.6rem 0;
}

.markdown-content p {
  margin: 0.5rem 0;
  line-height: 1.6;
}

.markdown-content ul,
.markdown-content ol {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.markdown-content li {
  margin: 0.25rem 0;
}

.markdown-content code {
  background-color: #f1f5f9;
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
}

.markdown-content pre {
  background-color: #f1f5f9;
  border-radius: 0.25rem;
  padding: 1rem;
  overflow-x: auto;
  margin: 1rem 0;
}

.markdown-content pre code {
  background-color: transparent;
  padding: 0;
}

.markdown-content blockquote {
  border-left: 4px solid #cbd5e1;
  padding-left: 1rem;
  margin: 1rem 0;
  color: #64748b;
}

.markdown-content a {
  color: #6366f1;
  text-decoration: underline;
}

.markdown-content a:hover {
  color: #4f46e5;
}

.markdown-content table {
  border-collapse: collapse;
  width: 100%;
  margin: 1rem 0;
}

.markdown-content th,
.markdown-content td {
  border: 1px solid #cbd5e1;
  padding: 0.5rem;
  text-align: left;
}

.markdown-content th {
  background-color: #f1f5f9;
  font-weight: bold;
}

.markdown-content tr:nth-child(even) {
  background-color: #f8fafc;
}
</style>