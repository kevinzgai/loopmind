<template>
  <div v-if="open" class="drawer-overlay" @click="close">
    <div class="drawer" @click.stop>
      <div class="drawer-header">
        <div class="drawer-title">历史记录</div>
        <button class="drawer-close" @click="close">关闭</button>
      </div>
      <div class="drawer-content">
        <div v-if="loading" class="drawer-loading">加载中...</div>
        <div v-else>
          <!-- 对话列表 -->
          <div v-if="view === 'list'" class="conversation-list">
             <div v-if="conversations.length === 0" class="drawer-empty">暂无历史对话</div>
             <div 
                v-for="conv in conversations" 
                :key="conv._id" 
                class="conversation-item"
                @click="loadConversation(conv._id)"
             >
                <div class="conv-title">{{ conv.title }}</div>
                <div class="conv-meta">
                   <span>{{ new Date(conv.updatedAt).toLocaleString() }}</span>
                   <span>{{ conv.messageCount }} 条消息</span>
                </div>
             </div>
          </div>

          <!-- 消息详情 -->
          <div v-else class="drawer-list">
            <button class="back-btn" @click="view = 'list'">← 返回列表</button>
            <div v-for="(msg, idx) in items" :key="idx" class="drawer-item">
              <div class="msg-role">{{ msg.role === 'user' ? '我' : '助手' }}</div>
              <div class="msg-content">{{ msg.content }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  userId: { type: String, required: true },
  provider: { type: String, required: true }
})

const emit = defineEmits(['close', 'select-conversation'])

const loading = ref(false)
const items = ref([])
const conversations = ref([])
const view = ref('list') // 'list' or 'detail'

async function fetchConversations() {
  loading.value = true
  try {
    // 假设后端添加了获取对话列表的接口
    // 如果没有，暂时还是用原来的逻辑，但这里我们模拟多会话结构
    const token = localStorage.getItem('token')
    if (token) {
        // 已登录用户，获取真实对话列表
        const res = await fetch(`/api/chat/conversations?provider=${props.provider}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
            const data = await res.json()
            conversations.value = data.conversations || []
            view.value = 'list'
            return
        }
    }
    
    // 未登录或获取失败，回退到原来的逻辑（获取最近一次对话）
    await fetchHistory()
    view.value = 'detail'
  } catch (e) {
    console.error(e)
    conversations.value = []
  } finally {
    loading.value = false
  }
}

async function fetchHistory(conversationId) {
  loading.value = true
  items.value = []
  try {
    const q = new URLSearchParams({ 
        userId: props.userId, 
        provider: props.provider,
        ...(conversationId ? { conversationId } : {})
    })
    
    // 如果有 token，加上 Authorization 头
    const token = localStorage.getItem('token')
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {}

    const res = await fetch(`/api/chat/history?${q.toString()}`, { headers })
    const data = await res.json()
    items.value = Array.isArray(data.messages) ? data.messages : []
    
    if (conversationId) {
        view.value = 'detail'
        // 可以在这里触发事件通知父组件加载该会话
        emit('select-conversation', conversationId)
    }
  } catch {
    items.value = []
  } finally {
    loading.value = false
  }
}

function loadConversation(id) {
    fetchHistory(id)
}

function close() {
  emit('close')
}

watch(() => props.open, (val) => {
  if (val) fetchConversations()
})
</script>

<style scoped>
/* ... (保留原有样式) ... */
.conversation-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}
.conversation-item {
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
}
.conversation-item:hover {
    background: #f7fafc;
    border-color: #cbd5e0;
}
.conv-title {
    font-weight: 500;
    color: #2d3748;
    margin-bottom: 0.25rem;
}
.conv-meta {
    font-size: 0.75rem;
    color: #718096;
    display: flex;
    justify-content: space-between;
}
.back-btn {
    margin-bottom: 1rem;
    font-size: 0.875rem;
    color: #4299e1;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    text-align: left;
}
.back-btn:hover {
    text-decoration: underline;
}
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: flex-end;
  z-index: 1000;
}
.drawer {
  width: 380px;
  max-width: 90vw;
  height: 100%;
  background: #fff;
  border-left: 1px solid #e2e8f0;
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
}
.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
}
.drawer-title {
  font-weight: 600;
  color: #2d3748;
}
.drawer-close {
  border: 1px solid #cbd5e0;
  background: #f7fafc;
  border-radius: 6px;
  padding: 0.25rem 0.75rem;
  color: #4a5568;
}
.drawer-content {
  padding: 1rem;
  flex: 1;
  overflow-y: auto;
}
.drawer-loading,
.drawer-empty {
  color: #718096;
}
.drawer-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.drawer-item {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
}
.msg-role {
  font-size: 0.75rem;
  color: #718096;
}
.msg-content {
  margin-top: 0.25rem;
  color: #1a202c;
  white-space: pre-wrap;
}
</style>
