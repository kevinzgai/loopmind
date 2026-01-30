<template>
  <div class="message-wrapper" :class="message.role === 'user' ? 'wrapper-user' : 'wrapper-assistant'">
    <div class="message-item" :class="message.role === 'user' ? 'message-user' : 'message-assistant'">
      <div class="bubble-content markdown-content" v-html="renderMessageContent(message.content)"></div>
    </div>
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
.message-wrapper {
  display: flex;
  width: 100%;
  margin-bottom: 1.5rem;
}

.wrapper-user {
  justify-content: flex-end;
}

.wrapper-assistant {
  justify-content: flex-start;
}

.message-item {
  max-width: 75%;
  padding: 1rem 1.25rem;
  border-radius: 1rem;
  font-size: 0.95rem;
  line-height: 1.7;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.message-user {
  @apply bg-primary text-primary-foreground;
  border-bottom-right-radius: 0.25rem;
}

.message-assistant {
  @apply bg-muted text-foreground border-border;
  border: 1px solid;
  border-bottom-left-radius: 0.25rem;
}

.bubble-content {
  word-break: break-word;
}

:deep(.markdown-content) {
  color: inherit;
}

:deep(.markdown-content) h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 1.25rem 0 0.625rem;
  padding-bottom: 0.5rem;
  @apply border-border;
  border-bottom: 1px solid;
}

:deep(.markdown-content) h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 1rem 0 0.5rem;
  padding-bottom: 0.375rem;
  @apply border-border;
  border-bottom: 1px solid;
}

:deep(.markdown-content) h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0.875rem 0 0.375rem;
}

:deep(.markdown-content) h4 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0.75rem 0 0.25rem;
}

:deep(.markdown-content) p {
  margin: 0.625rem 0;
  line-height: 1.75;
}

:deep(.markdown-content) p:first-child {
  margin-top: 0;
}

:deep(.markdown-content) p:last-child {
  margin-bottom: 0;
}

:deep(.markdown-content) ul,
:deep(.markdown-content) ol {
  margin: 0.625rem 0;
  padding-left: 1.5rem;
}

:deep(.markdown-content) li {
  margin: 0.375rem 0;
  line-height: 1.7;
}

:deep(.markdown-content) code {
  background-color: hsl(var(--muted) / 0.6);
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'JetBrains Mono', monospace;
  font-size: 0.875rem;
  font-weight: 500;
}

:deep(.markdown-content) pre {
  background-color: hsl(var(--muted) / 0.4);
  border-radius: 0.5rem;
  padding: 1rem;
  overflow-x: auto;
  margin: 1rem 0;
  @apply border-border;
  border: 1px solid;
}

:deep(.markdown-content) pre code {
  background-color: transparent;
  padding: 0;
  font-size: 0.875rem;
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

:deep(.markdown-content) table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
  @apply border-border;
  border: 1px solid;
}

:deep(.markdown-content) th,
:deep(.markdown-content) td {
  padding: 0.5rem 0.75rem;
  text-align: left;
  @apply border-border;
  border-bottom: 1px solid;
}

:deep(.markdown-content) th {
  font-weight: 600;
  @apply bg-muted;
}

:deep(.markdown-content) hr {
  border: none;
  height: 1px;
  @apply bg-border;
  margin: 1.5rem 0;
}

:deep(.markdown-content) img {
  max-width: 100%;
  border-radius: 0.5rem;
  margin: 0.5rem 0;
}

:deep(.markdown-content) strong {
  font-weight: 600;
}

@media (max-width: 768px) {
  .message-item {
    max-width: 85%;
    padding: 0.875rem 1rem;
  }

  .message-wrapper {
    margin-bottom: 1.25rem;
  }
}
</style>