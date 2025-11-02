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
              class="text-gray-800 prose prose-sm max-w-none"
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
            <div class="text-white prose prose-sm prose-invert max-w-none">
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
    
    // 简单的Markdown到HTML转换函数
    const markdownToHtml = (markdown) => {
      if (!markdown) return ''
      
      // 保存原始文本用于纯文本显示
      const originalText = markdown
      
      try {
        // 处理代码块
        markdown = markdown.replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 rounded p-3 my-2 overflow-x-auto"><code>$1</code></pre>')
        
        // 处理行内代码
        markdown = markdown.replace(/`([^`]+)`/g, '<code class="bg-gray-100 rounded px-1 py-0.5 font-mono text-sm">$1</code>')
        
        // 处理粗体
        markdown = markdown.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
        
        // 处理斜体
        markdown = markdown.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
        
        // 处理链接
        markdown = markdown.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-indigo-600 hover:underline">$1</a>')
        
        // 处理无序列表
        markdown = markdown.replace(/^\s*-\s+(.*)$/gm, '<li class="ml-4">$1</li>')
        markdown = markdown.replace(/(<li class="ml-4">.*<\/li>)+/gs, '<ul class="list-disc my-2">$&</ul>')
        
        // 处理有序列表
        markdown = markdown.replace(/^\s*\d+\.\s+(.*)$/gm, '<li class="ml-4">$1</li>')
        markdown = markdown.replace(/(<li class="ml-4">.*<\/li>)+/gs, '<ol class="list-decimal my-2">$&</ol>')
        
        // 处理标题
        markdown = markdown.replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold my-2">$1</h3>')
        markdown = markdown.replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold my-3">$1</h2>')
        markdown = markdown.replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold my-4">$1</h1>')
        
        // 处理引用
        markdown = markdown.replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 text-gray-600 my-2">$1</blockquote>')
        
        // 只有当文本包含明显的Markdown元素时才处理段落
        if (originalText.includes('\n\n') || 
            originalText.includes('#') || 
            originalText.includes('**') || 
            originalText.includes('*') || 
            originalText.includes('`') ||
            originalText.includes('[') ||
            originalText.includes('- ') ||
            originalText.match(/^\d+\./)) {
          // 处理段落
          markdown = markdown.replace(/^\s*(.*?)(\n\n|$)/gm, '<p class="my-2">$1</p>')
        }
        
        // 处理换行
        markdown = markdown.replace(/\n/g, '<br>')
        
        return markdown
      } catch (error) {
        // 如果转换失败，返回原始文本
        console.warn('Markdown conversion failed:', error)
        return originalText
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