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
          <div v-if="items.length === 0" class="drawer-empty">暂无历史记录</div>
          <div v-else class="drawer-list">
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

const emit = defineEmits(['close'])

const loading = ref(false)
const items = ref([])

async function fetchHistory() {
  loading.value = true
  items.value = []
  try {
    const q = new URLSearchParams({ userId: props.userId, provider: props.provider })
    const res = await fetch(`/api/chat/history?${q.toString()}`)
    const data = await res.json()
    items.value = Array.isArray(data.messages) ? data.messages : []
  } catch {
    items.value = []
  } finally {
    loading.value = false
  }
}

function close() {
  emit('close')
}

watch(() => props.open, (val) => {
  if (val) fetchHistory()
})
</script>

<style scoped>
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
