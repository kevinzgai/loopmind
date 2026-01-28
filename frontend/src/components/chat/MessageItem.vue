<template>
  <div class="message-item" :class="message.role === 'user' ? 'message-user' : 'message-assistant'">
    <div class="bubble-content" v-html="renderMessageContent(message.content)"></div>
  </div>
</template>

<script setup>
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const props = defineProps({
  message: {
    type: Object,
    required: true
  }
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
</script>

<style scoped>
.message-item {
  max-width: 80%;
  padding: 0.75rem 0.9rem;
  border-radius: 14px;
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 0.75rem;
}

.message-user {
  margin-left: auto;
  background: #1a73e8;
  color: #fff;
}

.message-assistant {
  margin-right: auto;
  background: #f1f5f9;
  color: #1a202c;
  border: 1px solid #e2e8f0;
}

.bubble-content {
  word-break: break-word;
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
